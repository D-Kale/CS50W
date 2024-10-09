
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("users/<int:id>", views.ShowUser, name="User"),
    path("follow/<int:userid>", views.followUser, name="Follow"),
    path('api/following-posts/', views.ShowFollowingPosts, name='following_posts'),


    path("api/createPost", views.CreatePost, name="Create"),
    path("api/posts", views.ShowPosts, name="Posts")
]
