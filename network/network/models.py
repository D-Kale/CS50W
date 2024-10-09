from django.contrib.auth.models import AbstractUser
from django.db import models

PRIVACY_OPTIONS = [
    ('PR', 'Private'),
    ('FR', 'Just friends'),
    ('PU', 'Public'),
]

class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers', blank=True)
    pass

class Post(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='userPost')
    postText = models.CharField(max_length=1500)
    timeData = models.DateTimeField(auto_now_add=True)
    images = models.ManyToManyField('PostImages', blank=True, related_name="ImagesPost")
    like = models.ManyToManyField(User, blank=True, related_name="LikedPost")
    privacity = models.CharField(max_length=2, choices=PRIVACY_OPTIONS, default='PU')

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.username,
            "senderId": self.sender.id,
            "postText": self.postText,
            "timeData": self.timeData.strftime('%B %d, %Y, %I:%M %p'),
            "privacy": self.privacity,
            "images": [image.image.url for image in self.images.all()], 
            "likes": self.like.count(),
        }

class PostImages(models.Model):
    image = models.ImageField()

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='UserComment')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True, related_name='PostedComment')
    like = models.ManyToManyField(User, blank=True, related_name="LikedComment")
    message = models.CharField(max_length=200)

class Notification(models.Model):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=20)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    posts = models.ManyToManyField(Post, related_name='tags', blank=True)
