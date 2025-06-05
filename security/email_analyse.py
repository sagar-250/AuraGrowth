import os
import json
from collections import defaultdict
from langchain_core.messages import SystemMessage, HumanMessage
from config import llm
from privacy import (
    secure_normalize, 
    scan_text_for_unicode,
    find_visual_confusables,
    analyze_phishing_risk
)


# Folder containing individual email .json files
EMAIL_FOLDER = "data"
OUTPUT_DIR = "classified_emails"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Classification prompt
SYSTEM_PROMPT = """
You are a helpful assistant for classifying emails by intent.

Classify the email into one main category. Choose from:

1. Customer Query
2. Expected Leads
3. Internal emails

Respond strictly in JSON format:
{
  "category": "Show of Interest"
}
"""

def classify_email(email_text):
    normalized_text = secure_normalize(email_text)
    unicode_issues = scan_text_for_unicode(normalized_text)
    visual_confusables = find_visual_confusables(normalized_text)
    phishing_risk, phishing_rationale = analyze_phishing_risk(normalized_text)
    
    # Add security context to the prompt
    security_context = f"""
    Technical security scan results:
    - Unicode issues detected: {len(unicode_issues) > 0}
    - Visual confusables detected: {len(visual_confusables) > 0}
    - Automated phishing assessment: {phishing_risk}
    
    Please consider these technical findings in your analysis.
    """
    
    enhanced_prompt = email_text + "\n\n" + security_context
    
    chat = llm.invoke([SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=enhanced_prompt)])
    try:
        content = chat.content
        classification_result = json.loads(content)
        classification_result["technical_security"] = {
            "unicode_issues_count": len(unicode_issues),
            "visual_confusables_count": len(visual_confusables),
            "phishing_risk": phishing_risk,
            "phishing_rationale": phishing_rationale,
            "is_suspicious": (
                len(unicode_issues) > 0 or
                len(visual_confusables) > 0 or
                phishing_risk in ["Medium", "High"]
            )
        }
        
        return classification_result
    except Exception as e:
        print("Error parsing response:", content)
        raise e

def load_email(filepath):
    with open(filepath, "r") as f:
        return json.load(f)


def main():
    categorized = defaultdict(list)

    files = [f for f in os.listdir(EMAIL_FOLDER) if f.endswith(".json")]
    for idx, filename in enumerate(files, 1):
        filepath = os.path.join(EMAIL_FOLDER, filename)
        email_id = os.path.splitext(filename)[0]

        try:
            email = load_email(filepath)
            full_text = f"Subject: {email.get('subject', '')}\n\n{email.get('body', '')}"
            print(f"[{idx}/{len(files)}] Classifying: {email_id}")
            result = classify_email(full_text)
            category = result["category"]
            categorized[category].append(email_id)
            
            if result.get("technical_security", {}).get("is_suspicious", False):
                with open(os.path.join(OUTPUT_DIR, "security_concerns.txt"), "a") as f:
                    f.write(f"Email ID: {email_id}\n")
                    f.write(f"Category: {category}\n")
                    f.write(f"Phishing Risk: {result['technical_security']['phishing_risk']}\n")
                    f.write(f"Rationale: {result['technical_security']['phishing_rationale']}\n")
                    f.write("-" * 50 + "\n")
        except Exception as e:
            print(f"Error in {filename}: {e}")

    # Save results
    for category, ids in categorized.items():
        safe_name = category.lower().replace(" ", "_") + ".txt"
        with open(os.path.join(OUTPUT_DIR, safe_name), "w") as f:
            f.write("\n".join(ids))

    print("✅ Classification complete!")

