import pandas as pd
import os
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain.tools import Tool
from langchain.agents import initialize_agent,AgentType
from langchain_core.tools import tool
import instructor
from pydantic import BaseModel
from typing import List
from genral import greetings,general_web_task
from dataset import dataset_creater
# from functions import find_nearest,assign_general,assign_specific
import asyncio
tool_map={"greeting":greetings,"dataset_maker":dataset_creater,"general_web_task":general_web_task}
# load_dotenv()

os.getenv("GROQ_API_KEY")

import json
from groq import Groq
import os

# Initialize Groq client
client = Groq()


class Argument(BaseModel):
    argument_name: str
    argument_value: str

class Tool(BaseModel):
    tool_name: str
    arguments: List[Argument]
    
class ResponseModel(BaseModel):
    tool_calls: list[Tool]
    
client = instructor.from_groq(Groq(), mode=instructor.Mode.JSON) 

def run_conversation(user_prompt,tools):
    tools=tools
    # Prepare the messages
    messages = [
        {
            "role": "system",
            "content": f"""
            **Instructions**:
            - Analyze the given steps, which include tool names and arguments.
            - Use these steps to generate the sequence of tool calls, ensuring correct ordering and dependency management.     
            
                   
            You have access to the following tool: {tools}.
            go through each argument and description if  provided properly and give every needed arg
            
            call a single tool at a time             
            
            """
        },
        {
            "role": "user",
            "content": user_prompt,
        }
    ]

    
    
    # Make the Groq API call
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_model=ResponseModel,
        messages=messages,
        temperature=0.9,
        max_tokens=1000,
    )

    return response.tool_calls

# # Example usage
# def validator_crrection(tools,llm_output,validation_message):
#     validation_message=f"""**Instructions**:
#         - edit the llm_output:{llm_output} according to the validation message:{validation_message}
#         - Ensure that all required arguments are present and correctly formatted. 
#         - Check for any inconsistencies or missing information in the tool calls.
        
#         You have access to the following tools: {tools}.
#         Go through each argument and description carefully to confirm they are provided correctly and all necessary arguments are included.
        
#         ."""
        
#     response = client.chat.completions.create(
#     model="llama-3.2-90b-vision-preview",
#     response_model=ResponseModel,
#     messages=validation_message,
#     temperature=0.9,
#     max_tokens=1000,
#     )

#     return response.tool_calls



def output(query,tools):
    tool_calls = run_conversation(query,tools)
    # print(tool_calls)
    
    output=[] 
    for i in tool_calls:
        output.append(i.json())
        
    return output  



# EXAMPLE
tools=[
     {
    "tool_name": "greeting",
    "tool_description": "for greeting ",
    "args": [
    {
    "arg_name": "user_query",
    "arg_type": "string",
    "is_array": False,
    "is_required": True,
    }
    ]
},
{
    "tool_name": "dataset_maker",
    "tool_description": "dynamicaly navigates through web and extracts data and returns back csv file of dataset",
    "args": [
    {
    "arg_name": "user_query",
    "arg_type": "string",
    "is_array": False,
    "is_required": True,
    }
    ]
},
{
    "tool_name": "general_web_task",
    "tool_description": "dose general web task , like fine cheap flihght ticket etc.",
    "args": [
    {
    "arg_name": "user_query",
    "arg_type": "string",
    "is_array": False,
    "is_required": False,
    }]
}]

user_prompt="go to https://www.crunchbase.com/ ai search for car company and get me back the list of company with their website link"   

async def tool_caller(user_prompt,tools=tools):    
    L=output(user_prompt,tools)
    print(L)
    for i in L:
        args={}
        i=json.loads(i)
        func=tool_map[i["tool_name"]]
        for arg in i["arguments"]:
            args[arg["argument_name"]]=arg["argument_value"]
        result,steps= await func(user_prompt)
        response={"type":i["tool_name"],"result":result,"steps":steps}    
        return response

# desc=asyncio.run(tool_caller(user_prompt,tools))
# print(desc)