"""Session authentication, car inventory and dealership JSON endpoints."""

from datetime import date
import json
from urllib.parse import quote

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import CarMake, CarModel
from .restapis import (
    ServiceError, analyze_review_sentiments, get_request, post_review,
)


def _error(message, status=400):
    return JsonResponse({"status": status, "error": message}, status=status)


def _body(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError) as error:
        raise ValueError("Send a valid JSON object") from error
    if not isinstance(data, dict):
        raise ValueError("Send a valid JSON object")
    return data


def _user_data(user):
    return {
        "userName": user.username,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
    }


@require_GET
@ensure_csrf_cookie
def session_user(request):
    data = {"isAuthenticated": request.user.is_authenticated}
    if request.user.is_authenticated:
        data.update(_user_data(request.user))
    return JsonResponse(data)


@csrf_exempt
@require_POST
def login_user(request):
    try:
        data = _body(request)
    except ValueError as error:
        return _error(str(error))
    username, password = data.get("userName"), data.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return _error("Username and password are required")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return _error("Invalid username or password", 401)
    login(request, user)
    return JsonResponse({**_user_data(user), "status": "Authenticated"})


@csrf_exempt
@require_POST
def logout_request(request):
    username = request.user.username if request.user.is_authenticated else ""
    logout(request)
    return JsonResponse({"userName": username, "status": "Logged out"})


@csrf_exempt
@require_POST
def registration(request):
    try:
        data = _body(request)
        fields = ("userName", "firstName", "lastName", "email", "password")
        if any(not isinstance(data.get(key), str) or not data[key].strip()
               for key in fields):
            return _error("Complete all registration fields")
        username = data["userName"].strip()
        User._meta.get_field("username").clean(username, None)
        validate_email(data["email"])
        user = User(
            username=username, first_name=data["firstName"].strip(),
            last_name=data["lastName"].strip(), email=data["email"].strip(),
        )
        user.full_clean(exclude=["password"], validate_unique=False)
        validate_password(data["password"], user=user)
        user.set_password(data["password"])
        with transaction.atomic():
            user.save()
    except IntegrityError:
        return _error("Username is already registered", 409)
    except (ValueError, ValidationError) as error:
        message = "; ".join(error.messages) if isinstance(
            error, ValidationError
        ) else str(error)
        return _error(message)
    login(request, user)
    return JsonResponse(
        {**_user_data(user), "status": "Authenticated"}, status=201
    )


@require_GET
def get_dealerships(request, state="All"):
    endpoint = "/fetchDealers"
    if state and state.lower() != "all":
        endpoint += "/" + quote(state, safe="")
    try:
        dealers = get_request(endpoint)
    except ServiceError as error:
        return _error(str(error), error.status)
    return JsonResponse({"status": 200, "dealers": dealers})


@require_GET
def get_dealer_details(request, dealer_id):
    try:
        dealer = get_request("/fetchDealer/" + str(dealer_id))
    except ServiceError as error:
        return _error(str(error), error.status)
    return JsonResponse({"status": 200, "dealer": dealer})


@require_GET
def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request("/fetchReviews/dealer/" + str(dealer_id))
        for review in reviews:
            review["sentiment"] = analyze_review_sentiments(review["review"])
    except ServiceError as error:
        return _error(str(error), error.status)
    return JsonResponse({"status": 200, "reviews": reviews})


@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return _error("Log in before posting a review", 403)
    try:
        data = _body(request)
        review = data.get("review", "")
        dealership = data.get("dealership")
        purchase = data.get("purchase", False)
        if (not isinstance(review, str) or not review.strip()
                or len(review) > 5000):
            return _error("Review must contain between 1 and 5000 characters")
        if (not isinstance(dealership, int) or isinstance(dealership, bool)
                or dealership < 1 or not isinstance(purchase, bool)):
            return _error("Invalid dealership or purchase value")
        if purchase:
            purchase_date = date.fromisoformat(data.get("purchase_date", ""))
            if purchase_date > date.today():
                return _error("Purchase date cannot be in the future")
            year = data.get("car_year")
            if (not isinstance(year, int) or isinstance(year, bool)
                    or year < 1900 or year > date.today().year + 1):
                return _error("Invalid car year")
            if not CarModel.objects.filter(
                car_make__name=data.get("car_make"),
                name=data.get("car_model"),
            ).exists():
                return _error("Choose a listed car make and model")
        payload = {
            "name": request.user.get_full_name() or request.user.username,
            "dealership": dealership, "review": review.strip(),
            "purchase": purchase,
            "purchase_date": data.get("purchase_date", "") if purchase else "",
            "car_make": data.get("car_make", "") if purchase else "",
            "car_model": data.get("car_model", "") if purchase else "",
            "car_year": data.get("car_year") if purchase else None,
            "sentiment": analyze_review_sentiments(review.strip()),
        }
        get_request("/fetchDealer/" + str(dealership))
        saved_review = post_review(payload)
    except (ValueError, TypeError) as error:
        return _error(str(error))
    except ServiceError as error:
        return _error(str(error), error.status)
    return JsonResponse({"status": 200, "review": saved_review}, status=201)


@require_GET
def get_cars(request):
    makes = list(CarMake.objects.order_by("name").values(
        "id", "name", "description", "country"
    ))
    models = [{
        "id": model.id,
        "CarMake": model.car_make.name,
        "CarModel": model.name,
        "CarType": model.type,
        "Year": model.year,
    } for model in CarModel.objects.select_related("car_make").order_by(
        "car_make__name", "name"
    )]
    return JsonResponse({"status": 200, "CarMakes": makes, "CarModels": models})


@require_GET
def analyze_review(request):
    text = request.GET.get("text", "")
    if not text.strip() or len(text) > 5000:
        return _error("Provide between 1 and 5000 characters")
    try:
        return JsonResponse({"sentiment": analyze_review_sentiments(text)})
    except ServiceError as error:
        return _error(str(error), error.status)
