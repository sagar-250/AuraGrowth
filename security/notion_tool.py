import os
import logging
from typing import List, Dict, Optional, Tuple, Any
import requests
from langchain_core.messages import HumanMessage,SystemMessage
from config import llm

from security.privacy import (
    secure_normalize,
    validate_input,
    scan_text_for_unicode,
    analyze_phishing_risk,
    highlight_suspicious_text,
    find_visual_confusables
)
class NotionAPIError(Exception):
    """Custom exception for Notion API errors"""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"Notion API Error ({status_code}): {message}")

class NotionClient:
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Notion client with API key from parameter or environment variable
        
        Args:
            api_key: Notion API key (optional, will use NOTION_TOKEN env var if not provided)
        """
        self.token = api_key or os.environ.get('NOTION_TOKEN')
        if not self.token:
            raise ValueError("Notion API token must be provided or set as NOTION_TOKEN environment variable")
            
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.logger = logging.getLogger("notion_client")
        
    def _sanitize_text(self, text: str, check_phishing: bool = False) -> Tuple[str, Dict[str, Any]]:
        """
        Sanitize text for security issues before sending to Notion or LLM.
        
        Args:
            text: Text to sanitize
            check_phishing: Whether to check for phishing content
            
        Returns:
            Tuple of (sanitized_text, security_info)
        """
        # Normalize text and remove directional override characters
        normalized_text = secure_normalize(text)
        
        # Validate input for suspicious patterns
        is_valid, error_message = validate_input(normalized_text)
        if not is_valid:
            self.logger.warning(f"Suspicious text pattern detected: {error_message}")
        
        # Scan for problematic Unicode characters
        detected_unicode = scan_text_for_unicode(normalized_text)
        if detected_unicode:
            self.logger.warning(f"Detected {len(detected_unicode)} suspicious Unicode characters")
            for char in detected_unicode[:5]:  # Log first 5 for brevity
                self.logger.debug(f"Suspicious char: {char}")
        
        # Find visually confusable character sequences
        detected_bigrams = find_visual_confusables(normalized_text)
        
        # Security assessment info
        security_info = {
            "is_valid": is_valid,
            "validation_message": error_message if not is_valid else "",
            "detected_unicode": detected_unicode,
            "detected_bigrams": detected_bigrams,
            "phishing_risk": "Not Checked",
            "phishing_rationale": ""
        }
        
        # Optionally analyze for phishing indicators
        if check_phishing and len(normalized_text) > 20:  # Only check substantial content
            phishing_risk, phishing_rationale = analyze_phishing_risk(normalized_text)
            security_info["phishing_risk"] = phishing_risk
            security_info["phishing_rationale"] = phishing_rationale
            
            if phishing_risk != "Low":
                self.logger.warning(
                    f"Potential {phishing_risk} risk phishing content detected: {phishing_rationale}"
                )
        
        return normalized_text, security_info
    

    def _handle_response(self, response: requests.Response) -> Dict:
        """Process API response and handle errors"""
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            self.logger.warning("Rate limit exceeded, consider implementing rate limiting")
            raise NotionAPIError(429, "Rate limit exceeded")
        elif response.status_code == 401:
            raise NotionAPIError(401, "Unauthorized - check your API token")
        else:
            try:
                error_data = response.json()
                error_message = error_data.get('message', 'Unknown error')
            except:
                error_message = response.text
            raise NotionAPIError(response.status_code, error_message)

    # DATABASE OPERATIONS
    def query_database(self, database_id: str, filter_params: Optional[Dict] = None, sorts: Optional[List] = None, page_size: int = 100) -> List[Dict]:
        """
        Query a Notion database with filters and sorting
        
        Args:
            database_id: ID of the database to query
            filter_params: Filters to apply to the query
            sorts: Sorting parameters
            page_size: Number of results per page
            
        Returns:
            List of database items
        """
        url = f"{self.base_url}/databases/{database_id}/query"
        payload = {
            "page_size": page_size
        }
        
        if filter_params:
            payload["filter"] = filter_params
        if sorts:
            payload["sorts"] = sorts
            
        all_results = []
        has_more = True
        start_cursor = None
        
        while has_more:
            if start_cursor:
                payload["start_cursor"] = start_cursor
                
            response = requests.post(url, headers=self.headers, json=payload)
            data = self._handle_response(response)
            
            all_results.extend(data.get("results", []))
            has_more = data.get("has_more", False)
            start_cursor = data.get("next_cursor")
            
        return all_results

    # CONTENT OPERATIONS
    def get_page_content(self, page_id: str) -> List[Dict]:
        """
        Retrieve all content blocks from a page with pagination handling
        
        Args:
            page_id: ID of the page to retrieve
            
        Returns:
            List of parsed content blocks
        """
        all_blocks = []
        url = f"{self.base_url}/blocks/{page_id}/children"
        start_cursor = None
        
        while True:
            params = {"start_cursor": start_cursor} if start_cursor else {}
            response = requests.get(url, headers=self.headers, params=params)
            data = self._handle_response(response)
            
            all_blocks.extend(data.get("results", []))
            
            if data.get("has_more"):
                start_cursor = data.get("next_cursor")
            else:
                break
            
        return self._parse_blocks(all_blocks)

    def _parse_blocks(self, blocks: List[Dict]) -> List[Dict]:
        """
        Parse different block types into simplified structure
        
        Args:
            blocks: Raw blocks from Notion API
            
        Returns:
            List of parsed blocks with simplified structure
        """
        parsed = []
        for block in blocks:
            if not block or "type" not in block:
                self.logger.warning(f"Skipping invalid block: {block}")
                continue
                
            block_type = block["type"]
            content = {
                "id": block["id"],
                "type": block_type,
                "text": "",
                "url": "",
                "children": []
            }

            # Handle different block types
            if block_type in ["paragraph", "heading_1", "heading_2", "heading_3", "toggle", "quote"]:
                rich_text = block.get(block_type, {}).get("rich_text", [])
                content["text"] = " ".join([rt.get("plain_text", "") for rt in rich_text])
                
            elif block_type == "image":
                image_block = block.get("image", {})
                # Handle both external and uploaded images
                if "file" in image_block:
                    content["url"] = image_block["file"].get("url", "")
                elif "external" in image_block:
                    content["url"] = image_block["external"].get("url", "")
                    
            elif block_type in ["bulleted_list_item", "numbered_list_item", "to_do"]:
                rich_text = block.get(block_type, {}).get("rich_text", [])
                content["text"] = " ".join([rt.get("plain_text", "") for rt in rich_text])
                if block_type == "to_do":
                    content["checked"] = block.get("to_do", {}).get("checked", False)
                    
            elif block_type == "code":
                rich_text = block.get("code", {}).get("rich_text", [])
                content["text"] = " ".join([rt.get("plain_text", "") for rt in rich_text])
                content["language"] = block.get("code", {}).get("language", "")
                
            elif block_type == "table":
                content["table"] = {
                    "has_column_header": block.get("table", {}).get("has_column_header", False),
                    "has_row_header": block.get("table", {}).get("has_row_header", False),
                    "rows": block.get("table", {}).get("table_width", 0)
                }
            sanitized_text, security_info = self._sanitize_text(content)
            content["text"] = sanitized_text
            content["security_info"] = security_info
            # Recursively get children
            if block.get("has_children", False):
                content["children"] = self.get_page_content(block["id"])
                
            
            
            if security_info["detected_unicode"] or not security_info["is_valid"]:
                self.logger.warning(
                    f"Retrieved potentially unsafe content from block {block['id']}: "
                    f"{security_info['validation_message']}"
                )
            parsed.append(content)
        return parsed

    def update_block_content(self, block_id: str, new_text: str, block_type: str = None) -> Dict:
        """
        Update text content of an existing block
        
        Args:
            block_id: ID of the block to update
            new_text: New text content
            block_type: Type of the block (if known)
            
        Returns:
            Updated block data
        """
        url = f"{self.base_url}/blocks/{block_id}"
        
        sanitized_text, security_info = self._sanitize_text(new_text)
        
        if security_info["detected_unicode"] or not security_info["is_valid"]:
            self.logger.warning(
                f"Security concerns in content being sent to Notion block {block_id}: "
                f"Unicode issues: {len(security_info['detected_unicode'])}, "
                f"Valid input: {security_info['is_valid']}"
            )
    
        # If block_type is not provided, retrieve it first
        if not block_type:
            block_response = requests.get(url, headers=self.headers)
            block_data = self._handle_response(block_response)
            block_type = block_data.get("type")
            
        payload = {
            block_type: {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": sanitized_text}
                }]
            }
        }
        
        response = requests.patch(url, headers=self.headers, json=payload)
        return self._handle_response(response)

    def append_blocks(self, parent_id: str, blocks: List[Dict]) -> Dict:
        """
        Add new blocks to a page or block
        
        Args:
            parent_id: ID of the parent page or block
            blocks: List of block objects to append
            
        Returns:
            Response data with created blocks
        """
        url = f"{self.base_url}/blocks/{parent_id}/children"
        payload = {"children": blocks}
        response = requests.patch(url, headers=self.headers, json=payload)
        return self._handle_response(response)

    def create_simple_block(self, block_type: str, content: str) -> Dict:
        """
        Helper to create a simple block object for appending
        
        Args:
            block_type: Type of block to create
            content: Text content for the block
            
        Returns:
            Block object ready for the API
        """
        sanitized_content, security_info = self._sanitize_text(content)
        if not security_info["is_valid"]:
            self.logger.warning(
            f"Creating block with potentially unsafe content: {security_info['validation_message']}"
        )
    
        return {
            "object": "block",
            "type": block_type,
            block_type: {
                "rich_text": [{"type": "text", "text": {"content": sanitized_content}}]
            }
        }

    # COMMENT OPERATIONS
    def create_comment(self, parent_id: str, text: str, is_page: bool = True) -> Dict:
        """
        Create comment on page or specific block
        
        Args:
            parent_id: ID of the parent page or block
            text: Comment text
            is_page: Whether parent_id refers to a page (True) or block (False)
            
        Returns:
            Created comment data
        """
        url = f"{self.base_url}/comments"
        sanitized_text, security_info = self._sanitize_text(text, check_phishing=True)
        if security_info["phishing_risk"] not in ["Low", "Not Checked"]:
            self.logger.warning(
                f"Potential phishing content detected in comment text: {security_info['phishing_rationale']}"
            )
        payload = {
            "parent": {"page_id": parent_id} if is_page else {"block_id": parent_id},
            "rich_text": [{"type": "text", "text": {"content": sanitized_text}}]
        }
        response = requests.post(url, headers=self.headers, json=payload)
        return self._handle_response(response)

    def get_comments(self, block_id: str) -> List[Dict]:
        """
        Retrieve comments for a block/page
        
        Args:
            block_id: ID of the block or page
            
        Returns:
            List of comments
        """
        url = f"{self.base_url}/comments?block_id={block_id}"
        response = requests.get(url, headers=self.headers)
        return self._handle_response(response).get("results", [])

    # AI INTEGRATION
    def summarize_with_llm(self, data: Any, data_type: str = "content", prompt_template: str = None) -> str:
        """
        Use the configured LLM to summarize different types of Notion data
        
        Args:
            data: Data to summarize (page content, comments, or database results)
            data_type: Type of data ('content', 'comments', or 'database')
            prompt_template: Custom prompt template (optional)
            
        Returns:
            Summarized content from LLM
        """
        # Prepare content based on data type
        if data_type == "content":
            # For page content, extract text from blocks
            extracted_text = ""
            for block in data:
                if block.get("text"):
                    block_text = f"{block['type'].upper()}: {block['text']}\n"
                    extracted_text += block_text
                    
                    # Include children if any
                    if block.get("children"):
                        for child in block["children"]:
                            if child.get("text"):
                                extracted_text += f"  - {child['text']}\n"
        
        elif data_type == "comments":
            # For comments, extract comment text
            extracted_text = "COMMENTS:\n"
            for comment in data:
                rich_text = comment.get("rich_text", [])
                comment_text = " ".join([rt.get("plain_text", "") for rt in rich_text])
                created_time = comment.get("created_time", "")
                extracted_text += f"- [{created_time}] {comment_text}\n"
        
        elif data_type == "database":
            # For database results, extract properties
            extracted_text = "DATABASE ENTRIES:\n"
            for entry in data:
                extracted_text += "ENTRY:\n"
                properties = entry.get("properties", {})
                for prop_name, prop_value in properties.items():
                    prop_type = prop_value.get("type", "")
                    if prop_type == "title":
                        title_text = " ".join([rt.get("plain_text", "") for rt in prop_value.get("title", [])])
                        extracted_text += f"  TITLE: {title_text}\n"
                    elif prop_type == "rich_text":
                        rich_text = " ".join([rt.get("plain_text", "") for rt in prop_value.get("rich_text", [])])
                        extracted_text += f"  {prop_name}: {rich_text}\n"
                    elif prop_type in ["number", "checkbox", "select", "date"]:
                        extracted_text += f"  {prop_name}: {prop_value.get(prop_type, '')}\n"
        
        else:
            raise ValueError(f"Unsupported data type: {data_type}")
        
        # Set default prompt template based on data type if not provided
        if prompt_template is None:
            if data_type == "content":
                prompt_template = "Summarize this page content in a concise way, highlighting the key points:\n\n{content}"
            elif data_type == "comments":
                prompt_template = "Summarize these comments, noting key discussion points and any decisions made:\n\n{content}"
            elif data_type == "database":
                prompt_template = "Summarize these database entries, highlighting patterns and key information:\n\n{content}"
        
        # Use existing sanitization and LLM invocation logic
        sanitized_content, security_info = self._sanitize_text(extracted_text, check_phishing=True)
        
        # Log potential security issues
        if security_info["phishing_risk"] not in ["Low", "Not Checked"]:
            self.logger.warning(
                f"Sending potential {security_info['phishing_risk']} risk content to LLM: {security_info['phishing_rationale']}"
            )
        
        if security_info["detected_unicode"]:
            self.logger.warning(f"Content sent to LLM contains {len(security_info['detected_unicode'])} suspicious Unicode characters")
        
        prompt = prompt_template.format(content=sanitized_content)
        system_message = SystemMessage(content="Summarize the provided content accurately and concisely. Maintain factual accuracy and do not add speculative information.")
        messages = [system_message, HumanMessage(content=prompt)]
        
        try:
            response = llm.invoke(messages)
            sanitized_output, output_security = self._sanitize_text(response.content)
            if not output_security["is_valid"] or output_security["detected_unicode"]:
                self.logger.warning("LLM returned potentially unsafe content that was sanitized")
                return sanitized_output
            return response.content
        except Exception as e:
            self.logger.error(f"Error using LLM for summarization: {str(e)}")
            return f"Failed to summarize content: {str(e)}"

if __name__ == "__main__":
    client = NotionClient()
    
    # Example of API usage
    try:
        # Get and enhance content
        PAGE_ID ='13c588c6f8cb8098ae5eefc4447139bd'#os.environ.get("NOTION_TEST_PAGE_ID")
        if not PAGE_ID:
            print("Set NOTION_TEST_PAGE_ID env var to test the client")
            exit(1)
            
        print("Retrieving page content...")
        content = client.get_page_content(PAGE_ID)
        
        # Find first paragraph to enhance
        for block in content:
            if block["type"] == "paragraph" and block["text"]:
                original_text = block["text"]
                print(f"Original text: {original_text}")
                if "security_info" in block and block["security_info"].get("detected_unicode"):
                    print(f"⚠️ Security warning: Found {len(block['security_info']['detected_unicode'])} suspicious characters")
                
                # Enhance with LLM
                enhanced_text = client.summarize_with_llm(original_text)
                print(f"Enhanced text: {enhanced_text}")
                
                # Update the block
                client.update_block_content(block["id"], enhanced_text, "paragraph")
                print("Block updated successfully")
                
                
    except NotionAPIError as e:
        print(f"API Error: {e}")
    except Exception as e:
        print(f"Error: {str(e)}")
        

        
