import requests
import os
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")


def get_request(endpoint, **kwargs):
    params = ""
    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + str(value) + "&"
        params = "?" + params.rstrip("&")
    request_url = backend_url + endpoint + params

    print("GET from {} ".format(request_url))
    try:
        response = requests.get(request_url, timeout=30)
        return response.json()
    except Exception as err:
        print("Network exception occurred: ", err)
        return []


def analyze_review_sentiments(text):
    request_url = sentiment_analyzer_url + "analyze/" + text
    print("GET from {} ".format(request_url))
    try:
        response = requests.get(request_url, timeout=30)
        return response.json()["sentiment"]
    except Exception as err:
        print("Network exception occurred: ", err)
        return "neutral"


def post_review(data_dict):
    request_url = backend_url + "/review"

    try:
        response = requests.post(request_url, json=data_dict, timeout=30)
        return response.json()
    except Exception as err:
        print("Network exception occurred: ", err)
        return {"status": 500, "message": "Unable to post the review"}
