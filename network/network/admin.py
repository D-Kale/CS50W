from django.contrib import admin

from network.models import User, Post, PostImages, Notification, Tag


# Register your models here.

admin.site.register(User)
admin.site.register(Post)
admin.site.register(PostImages)
admin.site.register(Notification)
admin.site.register(Tag)