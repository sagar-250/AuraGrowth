import requests
import re
import asyncio
from langchain_openai import AzureChatOpenAI
from pydantic import BaseModel,Field
from typing import List
import json
# Your Azure OpenAI deployment settings
# your model deployment name


# Define your output schema
# Create the Azure OpenAI model
chat = AzureChatOpenAI(
    azure_deployment=AZURE_DEPLOYMENT_NAME,
    azure_endpoint=AZURE_ENDPOINT,
    api_key=AZURE_API_KEY,
    openai_api_version="2024-08-01-preview",
    temperature=0,
    model="gpt-4-1106-preview",  # Required for JSON mode
)

class ListModel(BaseModel):
    list: List[str] = Field(default_factory=list, description="name of company")

# Use with structured output
structured_chat = chat.with_structured_output(
    schema=ListModel,
    method="json_mode"
)

async def url_shortlister(user_query):
    messages = [
    {
        "role": "system",
        "content": """
        **Task Instructions**:
        you would be provided with list of urls related to a company , your aim should be to get top 2 urls among those which you think will have most important information .

        Output json Format:{
        list:["URL A", "URL B", "URL C"]
        }
        """
    },
    {
        "role": "user",
        "content": user_query
    },]

    response = structured_chat.invoke(messages)
    # print(response.list)
    return(response.list)






def get_clean_content(url):
    proxy_url = f"https://r.jina.ai/{url}"
    response = requests.get(proxy_url)
    return response.text

async def source(url=None):
    content = get_clean_content(url)

    def extract_non_image_links(text):
        image_exts = "png|jpg|jpeg|gif|webp|svg|bmp|ico|tiff|avif"
        pattern = r'(?<!\!)\[(.*?)\]\((https?://[^\s\)]+)\)'
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        return [
            url for _, url in matches
            if not re.search(rf'\.({image_exts})$', url, flags=re.IGNORECASE)
        ]

    list=extract_non_image_links(content)
    shortlisted_url= await url_shortlister(json.dumps(list))
    shortlisted_url.insert(0,url)
    print(shortlisted_url)
    return(shortlisted_url)

# asyncio.run(source())