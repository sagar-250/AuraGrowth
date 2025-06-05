from langchain_openai import AzureChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

llm = AzureChatOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    max_retries=5
)

memory_config = {
    "llm": {
        "provider": "azure_openai",
        "config": {
            "model": "gpt-4o",
            "temperature": 0.1,
            "max_tokens": 3000,
            "azure_kwargs": {
                  
              }
        }
    },

    "embedder": {
        "provider": "gemini",
        "config": {
            "model": "models/text-embedding-004"
        }
    },

    "graph_store": {
        "provider": "neo4j",
        "config": {
            "url": "neo4j+s://92d4fe0d.databases.neo4j.io",
            "username": "neo4j",
            "password": "ZL837RLFrpAtxwIv0HJ3JO-s20WAwsEGSqv7-elUbzg"
        },
        "llm": {
        "provider": "azure_openai",
        "config": {
            "model": "gpt-4o",
            "temperature": 0.1,
            "max_tokens": 3000,
            "azure_kwargs": {
                  
              }
            }
        }
    },

    "vector_store": {
        "provider": "chroma",
        "config": {
            "collection_name": "test1",
            "path": "db"
        }
    },

    "version": "v1.1"
}
