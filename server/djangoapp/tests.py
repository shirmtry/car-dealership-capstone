from unittest.mock import patch

from django.contrib import admin
from django.contrib.auth.models import User
from django.test import Client, TestCase

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import ServiceError


class AuthenticationTests(TestCase):
    def setUp(self):
        self.account = {
            'userName': 'test_buyer', 'firstName': 'Casey', 'lastName': 'Morgan',
            'email': 'casey@example.com', 'password': 'StudyDemo!2026Only',
        }

    def test_registration_creates_an_authenticated_session(self):
        response = self.client.post('/djangoapp/register', self.account,
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        session = self.client.get('/djangoapp/session').json()
        self.assertTrue(session['isAuthenticated'])
        self.assertEqual(session['userName'], 'test_buyer')
        user = User.objects.get(username='test_buyer')
        self.assertTrue(user.check_password(self.account['password']))
        self.assertNotEqual(user.password, self.account['password'])

    def test_duplicate_registration_returns_conflict(self):
        self.client.post('/djangoapp/register', self.account,
                         content_type='application/json')
        response = self.client.post('/djangoapp/register', self.account,
                                    content_type='application/json')
        self.assertEqual(response.status_code, 409)
        self.assertEqual(User.objects.filter(username='test_buyer').count(), 1)

    def test_login_failure_and_logout_invalidate_session(self):
        self.client.post('/djangoapp/register', self.account,
                         content_type='application/json')
        response = self.client.post('/djangoapp/logout')
        self.assertEqual(response.json()['status'], 'Logged out')
        self.assertFalse(self.client.get('/djangoapp/session').json()['isAuthenticated'])
        response = self.client.post('/djangoapp/login', {
            'userName': 'test_buyer', 'password': 'incorrect',
        }, content_type='application/json')
        self.assertEqual(response.status_code, 401)
        response = self.client.post('/djangoapp/login', {
            'userName': 'test_buyer', 'password': self.account['password'],
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.client.get('/djangoapp/session').json()['isAuthenticated'])

    def test_invalid_json_and_method_are_rejected(self):
        self.assertEqual(self.client.post(
            '/djangoapp/register', '{invalid', content_type='application/json'
        ).status_code, 400)
        self.assertEqual(self.client.get('/djangoapp/login').status_code, 405)

    def test_review_requires_authentication_and_csrf(self):
        response = self.client.post('/djangoapp/add_review', {
            'dealership': 15, 'review': 'Helpful staff', 'purchase': False,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 403)
        user = User.objects.create_user('csrf_buyer', password='StudyDemo!2026Only')
        strict_client = Client(enforce_csrf_checks=True)
        strict_client.force_login(user)
        response = strict_client.post('/djangoapp/add_review', {
            'dealership': 15, 'review': 'Helpful staff', 'purchase': False,
        }, content_type='application/json')
        self.assertEqual(response.status_code, 403)

    @patch('djangoapp.views.get_request')
    def test_backend_failure_is_reported_as_failure(self, request):
        request.side_effect = ServiceError('Dealer service is unavailable')
        response = self.client.get('/djangoapp/get_dealers')
        self.assertEqual(response.status_code, 502)
        self.assertIn('unavailable', response.json()['error'])


class CarInventoryTests(TestCase):
    def test_population_is_idempotent_and_api_uses_orm(self):
        first = initiate()
        self.assertEqual(first, initiate())
        data = self.client.get('/djangoapp/get_cars').json()
        self.assertEqual(len(data['CarMakes']), CarMake.objects.count())
        self.assertEqual(len(data['CarModels']), CarModel.objects.count())
        self.assertTrue(data['CarMakes'])
        self.assertTrue(data['CarModels'])
        make_names = {make['name'] for make in data['CarMakes']}
        self.assertTrue(all(model['CarMake'] in make_names for model in data['CarModels']))
        self.assertTrue(admin.site.is_registered(CarMake))
        self.assertTrue(admin.site.is_registered(CarModel))
