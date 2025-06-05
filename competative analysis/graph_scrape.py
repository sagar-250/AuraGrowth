import os
from dotenv import load_dotenv
from scrapegraphai.graphs import SmartScraperMultiGraph
from scrapegraphai.utils import prettify_exec_info
import asyncio
import nest_asyncio
nest_asyncio.apply()
from google_search import google_search
from r_jina import source
load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")

graph_config = {
   "llm": {
      "api_key": openai_key,
      "model": "openai/gpt-4o",
   },
}




async def scrapper(company):
   base_url=google_search(company)
   print(base_url)
   url_list=await source(base_url[0])
   print("url_lsit",url_list)
   smart_scraper_graph = SmartScraperMultiGraph(
      prompt="List me all initiatives,achivements and novelty of this company",
      # also accepts a string with the already downloaded HTML code
      source=url_list,
      config=graph_config
   )

   result = smart_scraper_graph.run()
   print(result)
   return result 

# asyncio.run(scrapper("Tesla"))   