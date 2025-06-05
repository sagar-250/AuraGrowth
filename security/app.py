from fastapi import FastAPI, HTTPException
from typing import List
from pathlib import Path
import json

from pydantic import BaseModel

import email_extractor  # should have a main() function
import email_analyse 

app = FastAPI()
DATA_DIR = Path("data")  # folder where .txt and .json files are kept

# ------------------------ Endpoint 1 ------------------------
@app.get("/get-emails/{filename}")
def get_emails(filename: str) -> List[dict]:
    txt_file_path = DATA_DIR / f"{filename}.txt"

    if not txt_file_path.exists():
        raise HTTPException(status_code=404, detail="Text file not found")

    with open(txt_file_path, "r") as f:
        ids = [line.strip() for line in f if line.strip()]

    emails_data = []

    for email_id in ids:
        json_file_path = DATA_DIR / f"{email_id}.json"
        if json_file_path.exists():
            with open(json_file_path, "r") as jf:
                try:
                    data = json.load(jf)
                    emails_data.append(data)
                except json.JSONDecodeError:
                    continue
        else:
            continue

    return emails_data

# ------------------------ Endpoint 2 ------------------------
@app.post("/run-extractor")
def run_email_extractor():
    try:
        email_extractor.extract()  # make sure this exists
        return {"status": "success", "message": "emailextractor.py executed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


# ------------------------ Endpoint 3 ------------------------
@app.post("/run-analyzer")
def run_email_analyzer():
    try:
        email_analyse.main()  # make sure this exists
        return {"status": "success", "message": "email_analyzer.py executed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------ Endpoint 4 ------------------------
class ReplyRequest(BaseModel):
    message_id: str
    user_input: str

@app.post("/generate-reply")
def generate_email_reply(request: ReplyRequest):
    try:
        reply = email_extractor.reply(request.message_id, request.user_input)
        return {"status": "success", "reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    run_email_analyzer()