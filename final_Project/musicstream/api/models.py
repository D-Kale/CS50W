from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import os

# States for songs and playlists
STATES = [
    ("PU", "Public, it's Posted"),
    ("nPU", "Not Public, it's not Posted")
]

# User types
USERTYPES = [
    ("User", "Normal user"),
    ("SupUser", "Can send music")
]

def validate_audio_file(file):
    """Validator to ensure uploaded file is of a valid audio type."""
    if not file.name.endswith(('.mp3', '.wav', '.flac')):
        raise ValidationError("Invalid file type. Only .mp3, .wav, and .flac are allowed.")

def song_directory_path(instance, filename):
    """Function to determine upload path based on artist name."""
    return f'songs/{instance.artist}/{filename}'

class CustomUser(AbstractUser):
    type = models.CharField(max_length=10, choices=USERTYPES, default="User")

class Song(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, blank=True, default=None)
    name = models.CharField(max_length=500)
    state = models.CharField(max_length=3, choices=STATES, default="nPU")
    artist = models.CharField(max_length=50, blank=True)
    file = models.FileField(upload_to=song_directory_path, validators=[validate_audio_file])
    duration = models.DurationField()
    date = models.DateTimeField(auto_now_add=True)

    like = models.ManyToManyField(CustomUser, blank=True, related_name="LikedSong")

    def __str__(self):
        return self.name
    
    def serializer(self):
        return {
            'user': self.user.username,
            'id': self.id,
            'name': self.name,
            'state': self.state,
            'artist': self.artist,
            'file_url': self.file.url,
            'duration': str(self.duration),
            'date': self.date.strftime('%Y-%m-%d %H:%M:%S'),
            'likes': self.like.count()
        }

class Playlist(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=130)
    songs = models.ManyToManyField(Song, related_name="playlists")
    state = models.CharField(max_length=3, choices=STATES, default="nPU")
    duration = models.DurationField(default=timedelta())
    date = models.DateTimeField(auto_now_add=True)
    like = models.ManyToManyField(CustomUser, blank=True, related_name="LikedPlaylist")

    def calculate_duration(self):
        total_duration = sum(song.duration.total_seconds() for song in self.songs.all())
        return timedelta(seconds=total_duration)
    
    def serializer(self):
        return {
            'id': self.id,
            'name': self.name,
            'state': self.state,
            'likes': self.like.count(),
            'duration': str(self.duration),
            'songs': [song.serializer() for song in self.songs.all()],
        }
