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
    like = models.ManyToManyField(User, blank=True, related_name="LikedPost")

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.username,
            "senderId": self.sender.id,
            "postText": self.postText,
            "timeData": self.timeData.strftime('%B %d, %Y, %I:%M %p'),
            "likes": self.like.count(),
        }
