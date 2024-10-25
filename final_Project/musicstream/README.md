# Music Streaming Application

This project is a music streaming application built with Django that allows users to upload songs, create playlists, edit playlists, and manage the songs they like or dislike.

## Features

1. **Upload Songs**: Users can upload songs with their name, state (public or private), and audio file (.mp3, .wav, .flac).
2. **Create Playlists**: Users can create custom playlists by adding and removing songs.
3. **Edit Playlists**: Allows users to add new songs or remove ones they dislike without losing the existing ones.
4. **Like/Unlike**: Users can give 'like' or 'unlike' to songs and playlists.
5. **Playback History**: Keeps track of the history of songs played by users.

## Requirements

1. **Python 3.12 or higher**
2. **Django 5.1.2**
3. **Postman or cURL for API testing**
4. **File system** for managing uploaded songs.

## Installation

1. Clone this repository.
   ```bash
   git clone <REPOSITORY_URL>

# API Endpoints
## Songs
* GET /: Lists all available songs.
* POST /upload/: Uploads a new song. Must include name, state, artist, and the audio file (file).
* POST /edit/<int:songId>: Edits an existing song.
## Playlists
* GET /playlist/: Lists all playlists.
* POST /create-playlist/: Creates a new playlist with name, state, and a list of songs (songs).
* POST /edit-playlist/<int:playlistID>: Edits a playlist by adding or removing songs.
* DELETE /delete-playlist/<int:id>: Deletes a playlist by its ID.

# Helpers
### The project includes the following helpers:

* SaveSong: Saves the audio file to the file system.
* GetDuration: Calculates the duration of the audio file.

# Data Model
## Song
* name: Name of the song.
* state: State (Public or Private).
* artist: Artist of the song.
* file: Audio file.
* duration: Duration of the song.
* like: Many-to-Many relationship with the user.

## Playlist
* name: Name of the playlist.
* songs: Many-to-Many relationship with the songs.
* like: Many-to-Many relationship with the user.
* duration: Total duration of the playlist calculated.

Authors
Developed by Andres Sanchez