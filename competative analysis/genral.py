from langchain_openai import ChatOpenAI
from browser_use import Agent
from dotenv import load_dotenv
load_dotenv()
import asyncio
from graph_scrape import scrapper
from pydantic import BaseModel, Field
from typing import List,Dict,Any,Optional

from langchain_openai import AzureChatOpenAI
from pydantic import BaseModel
from typing import List

# Your Azure OpenAI deployment settings
AZURE_DEPLOYMENT_NAME = "gpt-4o"  # your model deployment name
AZURE_ENDPOINT = ""
AZURE_API_KEY = ""

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
    
llm = ChatOpenAI(
    openai_api_key="",
    model="gpt-4o")


async def list_generator(user_query):
    messages = [
    {
        "role": "system",
        "content": """
        **Task Instructions**:
        Extract a clean list of real, existing companies mentioned or implied in the input text. Only include legitimate company or brand names. Do not include products, people, or vague terms. Return as a list of top 1 standardized company names.

        Output json Format:{
        companies:["Company A", "Company B"]
        }
        """
    },
    {
        "role": "user",
        "content": user_query
    },]

    response = structured_chat.invoke(messages)
    print(response.companies)
    return(response.companies)

# async def info_classifier(user_query):
#     messages = [
#     {
#         "role": "system",
#         "content": """
#         **Task Instructions**:
#         you would be provided with list of facts related to a company , your aim should be to classify them as initiative or novelty or achivement.

#         Output json Format:{
#         initiative:["FAct A", "Fact B", "Fact C"],
#         novelty:["FAct A", "Fact B", "Fact C"],
#         achivements:["FAct A", "Fact B", "Fact C"]
#         }
#         """
#     },
#     {
#         "role": "user",
#         "content": user_query
#     },]

#     response = structured_clf.invoke(messages)
#     return(response) 


async def company_sesarch(query):    
    agent = Agent(
        task=query,
        llm=llm,
    )
    result = await agent.run()
    print(result)
    list=await list_generator(result.final_result())
    return(list)

async def main(query):
    comapny_list= await company_sesarch(query+".find top 1 company/startup related to this")
    extracted_data=[]
    for i in comapny_list:
        res=await scrapper(i)
        res["name"]=i
        extracted_data.append(res)
        print(extracted_data)
    return extracted_data    
    
    
# asyncio.run(main("buisness task automation"))        
        
