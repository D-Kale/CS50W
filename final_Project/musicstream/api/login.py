from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
import json
from .models import CustomUser

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        if request.user.is_authenticated:
            logout(request)
            return JsonResponse({'message': 'Logout successful'}, status=200)
        return JsonResponse({'error': 'User is not logged in'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            confirmation = data.get("confirmation")
        except (KeyError, json.JSONDecodeError):
            return JsonResponse({"error": "Invalid data format or missing fields"}, status=400)

        if not username or not email or not password:
            return JsonResponse({"error": "Username, email, and password are required"}, status=400)

        if password != confirmation:
            return JsonResponse({'error': 'Password and confirmation do not match'}, status=400)

        try:
            user = CustomUser.objects.create_user(username=username, email=email, password=password)
            user.save()
        except IntegrityError:
            return JsonResponse({"error": "Username already taken"}, status=400)

        login(request, user)
        return JsonResponse({"message": "User registered successfully"}, status=201)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)
