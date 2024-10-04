import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
from itsdangerous import Serializer

from .models import Notification, Post, PostImages, User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def CreatePost(request):
    
    if request.method == "POST":

        sender = request.user
        content = request.POST.get('content')
        privacy = request.POST.get('privacy')

        if not content or not privacy:
            return JsonResponse({"error": "Content or privacy setting is missing."}, status=400)

        newPost = Post(
            sender=sender,
            postText=content,
            privacity=privacy
        )
        newPost.save()

        if request.FILES.getlist('images'):
            for image in request.FILES.getlist('images'):
                newImage = PostImages(image=image)
                newImage.save()
                newPost.images.add(newImage)

        newPost.save()

        return JsonResponse({"message": "Post created successfully."}, status=201)
    
    return JsonResponse({"error": "Invalid request method."}, status=405)

def ShowPosts(request):
    if request.method == "GET":
        try:
            # Obtener todos los posts
            allPosts = Post.objects.all().order_by("-timeData")  # Cambia "timestamp" a "timeData"
            serialized_posts = [post.serialize() for post in allPosts]  # Asegúrate de que serialize esté definido
            return JsonResponse(serialized_posts, safe=False)  # Safe=False para listas
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)
