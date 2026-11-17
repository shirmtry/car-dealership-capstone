from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from datetime import datetime

import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .restapis import get_request, analyze_review_sentiments, post_review

# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    # Get username and password from request.POST dictionary
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)


# Create a `logout_request` view to handle sign out request
@csrf_exempt
def logout_request(request):
    data = {}
    if request.user.is_authenticated:
        username = request.user.username
        logout(request)
        data = {"userName": username, "status": "Logged out"}
    else:
        data = {"status": "Not logged in"}
    return JsonResponse(data)


# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')

    username_exist = False
    try:
        # Check if user already exists
        User.objects.get(username=username)
        username_exist = True
    except User.DoesNotExist:
        logger.debug("{} is new user".format(username))

    if not username_exist:
        # Create user in auth_user table
        user = User.objects.create_user(
            username=username, first_name=first_name,
            last_name=last_name, password=password, email=email)
        user.save()
        data = {"userName": username, "status": "Authenticated"}
        return JsonResponse(data)
    else:
        data = {"userName": username, "error": "Already Registered"}
        return JsonResponse(data)


# Update the `get_dealerships` view to render the index page with
# a list of dealerships
def get_dealerships(request, state="All"):
    if state == "All" or state is None:
        endpoint = "/dealers"
    else:
        endpoint = "/dealers/" + state
    dealerships = get_request(endpoint)
    return JsonResponse({
        "status": 200,
        "dealers": dealerships
    })


# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    if dealer_id:
        endpoint = "/reviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail['review'])
            review_detail['sentiment'] = response
        return JsonResponse({
            "status": 200,
            "reviews": reviews
        })
    else:
        return JsonResponse({
            "status": 400,
            "message": "Bad request"
        })


# Create a `get_dealer_details` view to render the dealer details
def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = "/dealer/" + str(dealer_id)
        dealer = get_request(endpoint)
        return JsonResponse({
            "status": 200,
            "dealer": dealer
        })
    else:
        return JsonResponse({
            "status": 400,
            "message": "Bad request"
        })


# Create a `add_review` view to submit a review
@csrf_exempt
def add_review(request):
    if request.user.is_authenticated:
        data = json.loads(request.body)
        try:
            response = post_review(data)
            return JsonResponse({"status": 200})
        except Exception as err:
            return JsonResponse({
                "status": 401,
                "message": "Error in posting review: " + str(err)
            })
    else:
        return JsonResponse({
            "status": 403,
            "message": "Unauthorized"
        })


def get_cars(request):
    cars = get_request("/cars")
    return JsonResponse({
        "status": 200,
        "CarModels": cars
    })


def analyze_review(request):
    text = request.GET.get('text', '')
    sentiment = analyze_review_sentiments(text)
    return JsonResponse({"sentiment": sentiment})
