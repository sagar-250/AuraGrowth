import unicodedata
import re
import logging
import time
import regex
from config import llm
import uvicorn
from langchain_core.messages import HumanMessage, SystemMessage
from typing import List, Dict, Any, Optional, Tuple

# Security-related imports
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("privacy-scanner")

app = FastAPI(title="Text Security Scanner API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanTextRequest(BaseModel):
    text: str

class ScanTextResponse(BaseModel):
    detected_unicode: List[Dict[str, Any]]
    detected_bigrams: List[Dict[str, Any]] = []
    phishing_risk: str
    phishing_rationale: str
    highlighted_text: Optional[str] = None
    scan_time_ms: float

INVISIBLE_CATS = {
    'Cf',  # Format characters (e.g., Zero Width Joiner U+200D)
    'Cc',  # Control characters (e.g., DELETE U+007F)
    'Zs',  # Space separators (e.g., Zero Width Space U+200B)
    'Zl',  # Line separators
    'Zp'   # Paragraph separators
}

CONFUSABLE_CHARS = {
    # Cyrillic Homoglyphs
    0x0410: 'A', 0x0430: 'a',  # А → A, а → a
    0x0415: 'E', 0x0435: 'e',  # Е → E, е → e
    0x041E: 'O', 0x043E: 'o',  # О → O, о → o
    0x0420: 'P', 0x0440: 'p',  # Р → P, р → p
    0x0421: 'C', 0x0441: 'c',  # С → C, с → c
    0x041A: 'K', 0x043A: 'k',  # К → K, к → k
    0x041C: 'M', 0x043C: 'm',  # М → M, м → m
    0x0422: 'T', 0x0442: 't',  # Т → T, т → t
    0x0425: 'X', 0x0445: 'x',  # Х → X, х → x

    # Greek Homoglyphs
    0x0391: 'A', 0x03B1: 'a',  # Α → A, α → a
    0x0395: 'E', 0x03B5: 'e',  # Ε → E, ε → e
    0x039F: 'O', 0x03BF: 'o',  # Ο → O, ο → o
    0x03A1: 'P', 0x03C1: 'p',  # Ρ → P, ρ → p
    0x03A3: 'S', 0x03C3: 's',  # Σ → S, σ → s
    0x03A4: 'T', 0x03C4: 't',  # Τ → T, τ → t
    0x03A7: 'X', 0x03C7: 'x',  # Χ → X, χ → x

    # Mathematical/Fullwidth Characters
    0x2160: 'I', 0x2161: 'II',  # Roman numerals
    0xFF21: 'A', 0xFF41: 'a',   # Ａ → A, ａ → a
    0xFF25: 'E', 0xFF45: 'e',   # Ｅ → E, ｅ → e
    0xFF2F: 'O', 0xFF4F: 'o',   # Ｏ → O, ｏ → o

    # Number Homoglyphs
    0x0405: 'S', 0x0455: 's',   # Ѕ → S, ѕ → s
    0x0392: 'B', 0x03B2: 'b',   # Β → B, β → b
    0x0398: 'O', 0x03B8: '0',   # Θ → O, θ → 0

    # Special Symbols
    0x00B7: '-',  # Middle dot → hyphen
    0x2010: '-',  # Hyphen → hyphen
    0x2212: '-',  # Minus sign → hyphen
    0xFF0D: '-'   # Fullwidth hyphen → hyphen
}

### Security Enhancements

RTL_OVERRIDES = {
    0x202E: '',  # Right-to-Left Override
    0x202D: '',  # Left-to-Right Override
    0x200F: '',  # Right-to-Left Mark
    0x200E: '',  # Left-to-Right Mark
    0x061C: '',  # Arabic Letter Mark
    0x2066: '',  # Left-to-Right Isolate
    0x2067: '',  # Right-to-Left Isolate
    0x2068: '',  # First Strong Isolate
    0x2069: ''   # Pop Directional Isolate
}

# Visual similar character sequences that can be confused
VISUAL_SIMILARS = {
    'rn': 'm',
    'vv': 'w',
    'cl': 'd',
    'nn': 'm',
    'vy': 'w',
    'ft': 'f',  
    'ij': 'y',
    'l1': 'h',
    'l!': 'l',
    'I1': 'I',
    '!I': 'I',
    '0O': 'O',
}

def secure_normalize(text: str) -> str:
    """Normalize text and remove directional override characters."""
    text = unicodedata.normalize('NFKC', text)
    for code, replacement in RTL_OVERRIDES.items():
        text = text.replace(chr(code), replacement)
    return text

def get_script_safely(char: str) -> str:
    """Safely get Unicode script name using regex module."""
    try:
        return regex.script(char)
    except (TypeError, AttributeError):
        return "Unknown"
    
def validate_input(text: str) -> Tuple[bool, str]:
    """Validate input text for suspicious patterns.
    
    Returns:
        Tuple[bool, str]: (is_valid, error_message)
    """
    # Get scripts used in text (excluding common and inherited)
    scripts = set()
    for c in text:
        if c.isalnum():
            script = get_script_safely(c)
            if script not in ('Common', 'Inherited', 'Unknown'):
                scripts.add(script)
    
    # Check for mixed scripts (allowing Latin + one other)
    
    # Check for invisible characters
    invisible_chars = []
    for c in text:
        cat = unicodedata.category(c)
        if cat in INVISIBLE_CATS and not c.isspace():
            invisible_chars.append(f"U+{ord(c):04X}")
    
    if invisible_chars:
        return False, f"Invisible characters detected: {', '.join(invisible_chars)}"
    
    return True, ""

def find_visual_confusables(text: str) -> List[Dict[str, Any]]:
    """Find character sequences that may be visually confused with others."""
    detected = []
    for i in range(len(text) - 1):
        bigram = text[i:i+2]
        if bigram in VISUAL_SIMILARS:
            detected.append({
                "chars": bigram,
                "pos": i,
                "looks_like": VISUAL_SIMILARS[bigram],
                "type": "visual_similar"
            })
    return detected

def highlight_suspicious_text(text: str, detected_unicode: List[Dict[str, Any]], detected_bigrams: List[Dict[str, Any]]) -> str:
    """Create HTML with highlighted suspicious characters."""
    result = list(text)
    
    # Mark all suspicious single characters
    for item in detected_unicode:
        pos = item["pos"]
        result[pos] = f"<mark class='unicode-{item['type']}'>{result[pos]}</mark>"
    
    # Mark all suspicious bigrams
    # Note: We need to be careful about overlapping highlights
    for item in detected_bigrams:
        pos = item["pos"]
        # Only highlight if not already highlighted
        if not (result[pos].startswith("<mark") or result[pos+1].startswith("<mark")):
            chars = item["chars"]
            result[pos] = f"<mark class='bigram'>{chars[0]}"
            result[pos+1] = f"{chars[1]}</mark>"
    
    return "".join(result)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log API requests for security monitoring."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"Path: {request.url.path} | "
        f"Method: {request.method} | "
        f"Status: {response.status_code} | "
        f"Time: {process_time:.4f}s | "
        f"Client: {request.client.host}"
    )
    return response

@app.post("/api/scan-text", response_model=ScanTextResponse)
async def scan_text(request: ScanTextRequest):
    """Scan text for security issues and phishing indicators."""
    start_time = time.time()
    
    # Normalize and validate input
    normalized_text = secure_normalize(request.text)
    is_valid, error_message = validate_input(normalized_text)
    
    if not is_valid:
        logger.warning(f"Invalid input detected: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Scan for problematic Unicode characters
    detected_unicode = scan_text_for_unicode(normalized_text)
    
    # Scan for visually confusable character sequences
    detected_bigrams = find_visual_confusables(normalized_text)
    
    # Generate highlighted text for display
    highlighted_text = highlight_suspicious_text(
        normalized_text, detected_unicode, detected_bigrams
    )
    
    # Analyze for phishing indicators
    phishing_assessment, phishing_rationale = analyze_phishing_risk(normalized_text)
    
    # Calculate processing time
    processing_time_ms = (time.time() - start_time) * 1000
    
    # Log results
    logger.info(
        f"Scan completed: {len(detected_unicode)} unicode issues, "
        f"{len(detected_bigrams)} visual confusables, "
        f"phishing risk: {phishing_assessment}"
    )
    
    return {
        "detected_unicode": detected_unicode,
        "detected_bigrams": detected_bigrams,
        "phishing_risk": phishing_assessment,
        "phishing_rationale": phishing_rationale,
        "highlighted_text": highlighted_text,
        "scan_time_ms": processing_time_ms
    }

def scan_text_for_unicode(text: str) -> List[Dict[str, Any]]:
    """Scans text and returns a list of detected problematic unicode characters."""
    detected_unicode = []
    for i, char in enumerate(text):
        char_ord = ord(char)
        category = unicodedata.category(char)
        
        # Check if character is invisible (excluding normal spaces)
        is_invisible = category in INVISIBLE_CATS and not char.isspace()
        
        # Check if character is confusable with common Latin characters
        is_confusable = char_ord in CONFUSABLE_CHARS
        
        if is_invisible or is_confusable:
            detected_unicode.append({
                "char": char,
                "ord": char_ord,
                "pos": i,
                "type": "invisible" if is_invisible else "confusable",
                "looks_like": CONFUSABLE_CHARS.get(char_ord) if is_confusable else None,
                "category": category
            })
    
    return detected_unicode

def analyze_phishing_risk(text: str) -> Tuple[str, str]:
    """Analyze text for phishing indicators using LLM.
    
    Returns:
        Tuple[str, str]: (risk_level, rationale)
    """
    phishing_assessment = "Not Analyzed"
    phishing_rationale = ""
    
    try:
        # Improved prompt with more specific instructions
        phishing_prompt = f"""
    Analyze the following text for phishing indicators using advanced security analysis techniques. Consider these critical indicators:

    1. Urgency or pressure tactics ("urgent", "immediately", "24 hours", "time-sensitive")
    2. Requests for sensitive information (credentials, financial data, personal identifiers)
    3. Generic or impersonal greetings ("Dear User", "Customer", "Account Holder")
    4. Suspicious links/domains (unusual TLDs, misspellings, numeric domains, URL shorteners)
    5. Sender impersonation (claiming to be from known organizations, banks, tech companies)
    6. Poor grammar, unusual phrasing, or inconsistent formatting
    7. Threats or consequences for inaction ("account suspended", "legal action", "security breach")
    8. Unexpected attachments or requests to download files
    9. Unusual sending addresses or domains that mimic legitimate ones
    10. Excessive secrecy or requests to keep communication private

    FORMATTING INSTRUCTIONS:
    Risk: [Low|Medium|High] - Choose exactly one risk level
    Rationale: [1-3 sentence explanation with specific indicators found]
    Keywords: [List 2-5 suspicious terms or patterns detected, if any]

    Text for analysis:
        ---
        {text}
        ---
        """
        
        # Call LLM with specific parameters for reliability
        response = llm.invoke([SystemMessage(content = "You are a cybersecurity expert specializing in phishing detection. Analyze text for phishing indicators with high precision. Maintain strict output formatting. For ambiguous cases, prioritize security by slightly elevating risk level. Focus on linguistic patterns, deception tactics, and social engineering techniques. Never include the original text in your response. If the text is too short or contains insufficient context, indicate 'Insufficient data' in your rationale but still provide a risk assessment."),HumanMessage(content = phishing_prompt)],temperature=0.1)
        
        content = response.content.strip()
        
        # More robust parsing with regex
        risk_match = re.search(r"Risk:\s*(Low|Medium|High)", content, re.IGNORECASE)
        rationale_match = re.search(r"Rationale:\s*(.+?)(?:\n|$)", content, re.DOTALL)
        
        if risk_match and rationale_match:
            phishing_assessment = risk_match.group(1).strip()
            phishing_rationale = rationale_match.group(1).strip()
        else:
            # Fallback parsing for unexpected formats
            lines = content.split('\n')
            for line in lines:
                if "risk" in line.lower():
                    phishing_assessment = line.split(":", 1)[1].strip() if ":" in line else line
                elif "rationale" in line.lower() or "reason" in line.lower():
                    phishing_rationale = line.split(":", 1)[1].strip() if ":" in line else line
            
            if phishing_assessment == "Not Analyzed" or not phishing_rationale:
                logger.warning(f"Failed to parse LLM response: {content}")
                phishing_assessment = "Analysis Error"
                phishing_rationale = "Unable to parse analysis results"

    except Exception as e:
        logger.error(f"Phishing analysis failed: {str(e)}")
        phishing_assessment = "Analysis Error"
        phishing_rationale = f"Error during analysis: {str(e)}"

    return phishing_assessment, phishing_rationale

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)