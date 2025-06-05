import os
import json
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from privacy import (
    secure_normalize,
    scan_text_for_unicode,
    find_visual_confusables,
    analyze_phishing_risk
)
TOKEN_PATH = r"client_secret_509962917003-a022ihg9i5ihqopaus3hn42d2nghm680.apps.googleusercontent.com.json"

# Define the scope
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly', # Read emails
    'https://www.googleapis.com/auth/gmail.compose', # Create drafts/send
    'https://www.googleapis.com/auth/gmail.modify' #if needed
]

def authenticate_gmail(creds_json_path):
    """Authenticate and build the Gmail API service."""
    creds = None

    # Load credentials from a file
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # If no (valid) credentials available, prompt the user to log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                creds_json_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open('token.json', 'w', encoding='utf-8') as token:
            token.write(creds.to_json())

    # Build the Gmail service
    service = build('gmail', 'v1', credentials=creds)
    return service

def extract_email_details(message):
    """Extract email details like sender, subject, body, and attachments."""
    payload = message.get('payload', {})
    headers = payload.get('headers', [])
    
    # Extract headers
    email_details = {
        "Date received": "",
        "id": "",
        "Sender": "",
        "Subject": "",
        "Body": "",
        "Attachments": []
    }
    
    for header in headers:
        if header['name'] == 'Date':
            email_details["Date received"] = header['value']
        elif header['name'] == 'From':
            email_details["Sender"] = header['value']
        elif header['name'] == 'Subject':
            email_details["Subject"] = header['value']
    
    # Extract body
    body = ""
    if 'data' in payload.get('body', {}):
        body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
    elif 'parts' in payload:
        for part in payload['parts']:
            if 'body' in part and 'data' in part['body']:
                body += base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
    email_details["Body"] = body.strip()
    
    # Extract attachments
    if 'parts' in payload:
        for part in payload['parts']:
            if part['filename']:
                email_details["Attachments"].append(part['filename'])
                
    if email_details["Body"]:
    # Normalize text for security analysis
        normalized_body = secure_normalize(email_details["Body"])
        normalized_subject = secure_normalize(email_details["Subject"])
        
        # Perform security scans
        email_details["security"] = {
            "unicode_issues": scan_text_for_unicode(normalized_body + normalized_subject),
            "visual_confusables": find_visual_confusables(normalized_body + normalized_subject),
        }
        
        # Analyze phishing risk
        combined_text = f"From: {email_details['Sender']}\nSubject: {email_details['Subject']}\n\n{email_details['Body']}"
        phishing_risk, phishing_rationale = analyze_phishing_risk(combined_text)
        email_details["security"]["phishing_risk"] = phishing_risk
        email_details["security"]["phishing_rationale"] = phishing_rationale
        
        # Add security flags
        email_details["security"]["is_suspicious"] = (
            len(email_details["security"]["unicode_issues"]) > 0 or
            len(email_details["security"]["visual_confusables"]) > 0 or
            phishing_risk in ["Medium", "High"]
    )

        return email_details


def save_email_to_json(folder_path, email_details, email_id):
    """Save email details to a JSON file."""
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    file_path = os.path.join(folder_path, f"{email_id}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(email_details, f, ensure_ascii=False, indent=4)

def process_all_emails(service, folder_path):
    """Fetch and save all emails in the inbox."""
    try:
        next_page_token = None
        total_emails = 0

        while True:
            # Fetch messages from the inbox
            results = service.users().messages().list(
                userId='me', labelIds=['INBOX'], pageToken=next_page_token
            ).execute()
            
            messages = results.get('messages', [])
            total_emails += len(messages)

            if not messages:
                print("No messages found.")
                break

            print(f"Processing {len(messages)} emails (total so far: {total_emails})...")

            # Process each message
            for msg in messages:
                msg_id = msg['id']
                message = service.users().messages().get(userId='me', id=msg_id).execute()
                email_details = extract_email_details(message)
                email_details['id'] = msg_id
                save_email_to_json(folder_path, email_details, msg_id)

            # Get the next page token
            next_page_token = results.get('nextPageToken')
            if not next_page_token:
                break

        print(f"Finished processing {total_emails} emails.")

    except Exception as error:
        print(f"An error occurred: {error}")



def fetch_and_save_emails(service, folder_path, hours):
    """Fetch emails from the last 12 hours and save them as JSON files."""
    try:
        # Calculate the time 12 hours ago
        twelve_hours_ago = datetime.utcnow() - timedelta(hours=hours)
        timestamp = int(twelve_hours_ago.timestamp())
        
        # Use the 'q' parameter to filter emails
        query = f"after:{timestamp}"
        results = service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])
        
        print(f"Found {len(messages)} emails from the last 12 hours.")
        
        # Process each email
        for msg in messages:
            msg_id = msg['id']
            message = service.users().messages().get(userId='me', id=msg_id).execute()
            email_details = extract_email_details(message)
            save_email_to_json(folder_path, email_details, msg_id)
            print(f"Saved email {msg_id} to JSON file.")
        
        print("All emails saved.")
    except Exception as error:
        print(f"An error occurred: {error}")



from email.mime.text import MIMEText

def reply_to_message(service, message_id, reply_text):
    """Reply to an email given its message ID and reply text."""
    try:
        # Step 1: Get the original message
        original_msg = service.users().messages().get(userId='me', id=message_id, format='full').execute()
        headers = original_msg['payload']['headers']
        thread_id = original_msg['threadId']

        # Step 2: Extract necessary headers
        to = next((h['value'] for h in headers if h['name'] == 'From'), None)
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        msg_id_header = next((h['value'] for h in headers if h['name'] == 'Message-ID'), None)

        # Step 3: Compose reply MIME message
        mime_msg = MIMEText(reply_text)
        mime_msg['To'] = to
        mime_msg['Subject'] = f"Re: {subject}"
        if msg_id_header:
            mime_msg['In-Reply-To'] = msg_id_header
            mime_msg['References'] = msg_id_header

        # Step 4: Encode message
        raw = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode()
        message_body = {
            'raw': raw,
            'threadId': thread_id
        }

        # Step 5: Send the reply
        sent_msg = service.users().messages().send(userId='me', body=message_body).execute()
        print(f"✅ Replied to message ID {message_id}. Reply ID: {sent_msg['id']}")

    except Exception as e:
        print(f"❌ Failed to reply to message: {e}")




def extract():
    service = authenticate_gmail(r"client_secret_509962917003-ci08mo8jijlaitidj2rfae3hch9ac36o.apps.googleusercontent.com.json")

    # Process the inbox
    # process_all_emails(service, r"data")
    fetch_and_save_emails(service, "data", 1)

def reply(msg_id, reply):
    service = authenticate_gmail(r"client_secret_509962917003-ci08mo8jijlaitidj2rfae3hch9ac36o.apps.googleusercontent.com.json")
    reply_to_message(service, msg_id, reply)
    
service = authenticate_gmail(TOKEN_PATH)
def list_upcoming_events():
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    events_result = service.events().list(calendarId='primary', timeMin=now,
                                          maxResults=10, singleEvents=True,
                                          orderBy='startTime').execute()
    events = events_result.get('items', [])

    if not events:
        print("No upcoming events found.")
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        print(start, event['summary'])

# Function to add a new event
def add_event(summary, start_time, end_time, timezone="Asia/Kolkata"):
    event = {
        'summary': summary,
        'start': {
            'dateTime': start_time,
            'timeZone': timezone,
        },
        'end': {
            'dateTime': end_time,
            'timeZone': timezone,
        },
    }

    event = service.events().insert(calendarId='primary', body=event).execute()
    print(f"Event created: {event.get('htmlLink')}")
