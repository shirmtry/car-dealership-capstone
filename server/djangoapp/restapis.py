"""HTTP clients for the real dealer backend and sentiment microservice."""

from functools import lru_cache
from urllib.parse import quote

from django.conf import settings
import requests


class ServiceError(Exception):
    """A service failed; report the failure instead of fabricating data."""

    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


def _response_json(response, service):
    if response.status_code == 404:
        raise ServiceError("Dealer not found", status=404)
    if not response.ok:
        raise ServiceError(service + " rejected the request")
    try:
        return response.json()
    except ValueError as error:
        raise ServiceError(service + " returned invalid JSON") from error


def get_request(endpoint, **kwargs):
    try:
        response = requests.get(
            settings.BACKEND_URL + "/" + endpoint.lstrip("/"),
            params=kwargs,
            timeout=settings.SERVICE_TIMEOUT,
        )
    except requests.RequestException as error:
        raise ServiceError("Dealer service is unavailable") from error
    data = _response_json(response, "Dealer service")
    if not isinstance(data, list):
        raise ServiceError("Dealer service returned an invalid collection")
    return data


@lru_cache(maxsize=2048)
def analyze_review_sentiments(text):
    try:
        response = requests.get(
            settings.SENTIMENT_URL + "/analyze/" + quote(text, safe=""),
            timeout=settings.SERVICE_TIMEOUT,
        )
    except requests.RequestException as error:
        raise ServiceError("Sentiment service is unavailable") from error
    data = _response_json(response, "Sentiment service")
    sentiment = data.get("sentiment")
    if sentiment not in ("positive", "negative", "neutral"):
        raise ServiceError("Sentiment service returned an invalid sentiment")
    return sentiment


def post_review(data_dict):
    try:
        response = requests.post(
            settings.BACKEND_URL + "/insert_review",
            json=data_dict,
            timeout=settings.SERVICE_TIMEOUT,
        )
    except requests.RequestException as error:
        raise ServiceError("Dealer service is unavailable") from error
    return _response_json(response, "Dealer service")
