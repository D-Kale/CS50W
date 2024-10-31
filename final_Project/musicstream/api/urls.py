from django.urls import path
from .views import *
from .login import *

urlpatterns = [
    path("", ShowSongs, name='show'),
    path("song/<int:songid>", ShowSongs, name='showSong'),
    path('upload/', CreateSong, name='upload_song_api'),
    path("edit/<int:songId>", EditSong, name='edit'),
    
    path('create-playlist/', CreatePlaylist, name='create-playlist'),
    path('edit-playlist/<int:playlistID>', edit_playlist, name="edit-playlist"),
    path('playlist/', ShowPlaylist, name="playlists"),
    path('playlist/<int:playlistId>', ShowPlaylist, name="playlist"),
    path('delete-playlist/<int:id>', delete_playlist, name="delete-playlist"),


    path('currentUser/', CurrentUser, name="currentuser"),
    path('currentUser/change/usertype/', SupUser, name="supUser"),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', register, name='register'),
]