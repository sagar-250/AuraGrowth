from langchain_openai import AzureChatOpenAI
from pydantic import BaseModel
from typing import List

# Your Azure OpenAI deployment settings


# Define your output schema
class CompanyList(BaseModel):
    companies: List[str]

# Create the Azure OpenAI model
chat = AzureChatOpenAI(
    azure_deployment=AZURE_DEPLOYMENT_NAME,
    azure_endpoint=AZURE_ENDPOINT,
    api_key=AZURE_API_KEY,
    openai_api_version="2024-08-01-preview",
    temperature=0,
    model="gpt-4-1106-preview",  # Required for JSON mode
)

# Use with structured output
structured_chat = chat.with_structured_output(
    schema=CompanyList,
    method="json_mode"
)

messages = [
    {
        "role": "system",
        "content": """
        **Task Instructions**:
        Extract a clean list of real, existing companies mentioned or implied in the input text. Only include legitimate company or brand names. Do not include products, people, or vague terms. Return as a list of standardized company names.

        Output json Format:{
        companies:["Company A", "Company B", "Company C"]
        }
        """
    },
    {
        "role": "user",
        "content": "Ola and Uber for Indian towns with Paytm integration and Rapido-style bikes.",  # Replace with actual user query
    },]

# Get structured response
response = structured_chat.invoke(messages)
print(response.companies)
