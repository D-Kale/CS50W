import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.core.paginator import Paginator

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



@login_required
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
            
            allPosts = Post.objects.all().order_by("-timeData") 
            serialized_posts = [post.serialize() for post in allPosts] 

            page_number = request.GET.get('page', 1) 
            paginator = Paginator(serialized_posts, 10)  
            page_obj = paginator.get_page(page_number)

            return JsonResponse({
                'posts': page_obj.object_list,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages
            }, safe=False)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

def ShowUser(request, id):
    user = get_object_or_404(User, id=id)
    is_following = user.followers.filter(id=request.user.id).exists()

    user_data = {
        "id": user.id,
        "name": user.username,
        "email": user.email,
        "followers": list(user.followers.values_list('username', flat=True)),
        "following": list(user.following.values_list('username', flat=True)),
        'is_following': is_following,
        "posts": [post.serialize() for post in user.userPost.all()]
    }
    
    return JsonResponse(user_data)

@login_required
def followUser(request, userid):
    try:
        follower = request.user
        user = get_object_or_404(User, id=userid)

        if request.method == "POST":
            if follower == user:
                return JsonResponse({'error': 'You cannot follow yourself.'}, status=400)

        if user.followers.filter(id=follower.id).exists():
            user.followers.remove(follower)
            return JsonResponse({'success': f'You have unfollowed {user.username}.', 
                                'following': False, 
                                'followersCount': user.followers.count(), 
                                'followingCount': user.following.count()})
        else:
            user.followers.add(follower)
            return JsonResponse({'success': f'You are now following {user.username}.', 
                                'following': True, 
                                'followersCount': user.followers.count(), 
                                'followingCount': user.following.count()})

        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required
def ShowFollowingPosts(request):
    if request.method == "GET":
        try:
            user = request.user
            following_users = user.following.all()
            following_posts = Post.objects.filter(sender__in=following_users).order_by("-timeData")
            
            serialized_posts = [post.serialize() for post in following_posts] 
            return JsonResponse(serialized_posts, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)
