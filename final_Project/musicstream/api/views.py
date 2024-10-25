from datetime import timedelta
from django.shortcuts import get_object_or_404, render
from .helpers import SaveSong, GetDuration
from .models import *

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def CreateSong(request):
    if request.method == "POST":
        user = request.user
        name = request.POST.get("name")
        state = request.POST.get("state")
        artist = request.POST.get("artist")
        file = request.FILES.get("file")
        
        if not name or not artist or not file:
            return JsonResponse({'error': 'Todos los campos son requeridos.'}, status=400)

        try:
            saved_file_path = SaveSong(file)
            duration_seconds = GetDuration(saved_file_path)

            duration = timedelta(seconds=duration_seconds)

            new_song = Song(
                user=user,
                name=name,
                state=state,
                artist=artist,
                file=saved_file_path,
                duration=duration
            )

            new_song.save()

            song_data = new_song.serializer()

            return JsonResponse({
                'message': 'Canción cargada exitosamente.',
                'song': song_data
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)

@csrf_exempt
def EditSong(request, songId):
    if request.method == "POST":
        song = get_object_or_404(Song, id=songId)

        name = request.POST.get("name")
        state = request.POST.get("state")
        file = request.FILES.get("file")

        if not name or not state:
            return JsonResponse({"error": "El nombre o el estado no pueden estar vacíos."}, status=400)

        song.name = name
        song.state = state

        if file:
            saved_file_path = SaveSong(file)
            duration = GetDuration(saved_file_path)
            song.file = saved_file_path
            song.duration = duration

        song.save()

        return JsonResponse({"success": "La canción ha sido editada exitosamente."})

    return JsonResponse({"error": "Método no permitido."}, status=405)

def ShowSongs(request):
    if request.method == "GET":

        all_songs = Song.objects.all()

        songs_data = []
        for song in all_songs:
            song = song.serializer()

            songs_data.append(song)

        return JsonResponse({'songs': songs_data}, status=200, safe=False)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)


@csrf_exempt
def CreatePlaylist(request):
    if request.method == "POST":
        try:
            name = request.POST.get("name")
            state = request.POST.get("state")
            song_ids = request.POST.getlist("songs")

            if not name or not song_ids:
                return JsonResponse({'error': 'Todos los campos son requeridos.'}, status=400)

            user = request.user

            songs = Song.objects.filter(id__in=song_ids)

            if not songs.exists():
                return JsonResponse({'error': 'No se encontraron canciones válidas.'}, status=404)

            new_playlist = Playlist(
                user=user,
                name=name,
                state=state
            )
            new_playlist.save()

            new_playlist.songs.set(songs)

            new_playlist.duration = new_playlist.calculate_duration()
            new_playlist.save()

            playlist_data = new_playlist.serializer()

            return JsonResponse({
                'message': 'Playlist creada exitosamente.',
                'playlist': playlist_data
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)

def ShowPlaylist(request):
    if request.method == "GET":

        all_playlists = Playlist.objects.all()

        playlist_data = []
        for playlist in all_playlists:
            playlist = playlist.serializer()

            playlist_data.append(playlist)

        return JsonResponse({'playlists': playlist_data}, status=200, safe=False)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)

@csrf_exempt
def delete_playlist(request, id):
    if request.method == "DELETE":
        playlist = get_object_or_404(Playlist, id=id)
        playlist.delete()
        return JsonResponse({'message': 'Playlist eliminada correctamente.'}, status=200)
    return JsonResponse({'error': 'Método no permitido.'}, status=405)

@csrf_exempt
def edit_playlist(request, playlistID):
    if request.method == "POST":
        playlist = get_object_or_404(Playlist, id=playlistID)

        name = request.POST.get("name")
        state = request.POST.get("state")
        add_song_ids = request.POST.getlist("add_songs")
        remove_song_ids = request.POST.getlist("remove_songs")

        if not name or not state:
            return JsonResponse({"error": "El nombre o el estado no pueden estar vacíos."}, status=400)

        playlist.name = name
        playlist.state = state

        if add_song_ids:
            songs_to_add = Song.objects.filter(id__in=add_song_ids)
            playlist.songs.add(*songs_to_add)

        if remove_song_ids:
            songs_to_remove = Song.objects.filter(id__in=remove_song_ids)
            playlist.songs.remove(*songs_to_remove)

        playlist.save()

        return JsonResponse({"success": "La playlist ha sido editada exitosamente."})

    return JsonResponse({"error": "Método no permitido."}, status=405)


def like(request, type, id):
    user = request.user

    if type == "Playlist":
        obj = get_object_or_404(Playlist, id=id)
    elif type == "Song":
        obj = get_object_or_404(Song, id=id)
    else:
        return JsonResponse({"error": "Tipo inválido."}, status=400)

    if request.method == "POST":
        if obj.like.filter(id=user.id).exists():
            obj.like.remove(user)
            message = f'Has removido tu like de {obj.name}.'
            liked = False
        else:
            obj.like.add(user)
            message = f'Has dado like a {obj.name}.'
            liked = True

        obj.save()

        return JsonResponse({
            "success": message,
            "likes": obj.like.count(),
            "liked": liked
        })
    else:
        return JsonResponse({"error": "Método no permitido."}, status=405)