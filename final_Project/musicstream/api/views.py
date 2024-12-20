from datetime import timedelta
from django.conf import settings
from django.shortcuts import get_object_or_404, render
from .helpers import SaveSong, GetDuration
from .models import *

from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import  login_required

@login_required
def CreateSong(request):
    if request.method == "POST":
        user = request.user

        name = request.POST.get("name")
        state = request.POST.get("state")
        artist = request.POST.get("artist")
        file = request.FILES.get("file")

        if not name or not artist or not file:
            return JsonResponse({'error': 'Todos los campos son requeridos.'}, status=400)

        if user.type != "SupUser":
            return JsonResponse({'error': "User doesn't have permission to enter new songs"}, status=403)

        try:
            saved_file_name = SaveSong(file)  # Guarda el archivo y obtiene la ruta relativa
            saved_file_path = default_storage.url(saved_file_name)  # Obtiene la URL del archivo guardado

            duration_seconds = GetDuration(os.path.join(settings.MEDIA_ROOT, saved_file_name))  # Cambia a la ruta completa para obtener la duración

            duration = timedelta(seconds=duration_seconds)

            new_song = Song(
                user=user,
                name=name,
                state=state,
                artist=artist,
                file=saved_file_name,  # Asigna la ruta relativa del archivo
                duration=duration
            )

            new_song.full_clean()  # Validar el modelo antes de guardarlo
            new_song.save()

            song_data = new_song.serializer()

            return JsonResponse({
                'message': 'Canción cargada exitosamente.',
                'song': song_data
            }, status=201)

        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            print("Error al guardar la canción:", e)
            return JsonResponse({'error': 'Ocurrió un error al crear la canción.'}, status=500)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)



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



def ShowSongs(request, songid=None):  # Establecer un valor por defecto para songid
    if request.method == "GET":
        if songid is not None:  # Verificar que songid no sea None
            try:
                song = Song.objects.get(id=songid)
                song_data = song.serializer()  # Usa song_data para mantener consistencia
                return JsonResponse({'song': song_data}, status=200)  # Retorna una sola canción
            except Song.DoesNotExist:
                return JsonResponse({'error': 'Canción no encontrada.'}, status=404)

        # Si no se especifica songid, devolver todas las canciones
        all_songs = Song.objects.all()
        songs_data = [song.serializer() for song in all_songs]  # List comprehension para simplificar
        return JsonResponse({'songs': songs_data}, status=200)

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

def ShowPlaylist(request, playlistId=None):  # Establecer un valor por defecto para playlist_id
    if request.method == "GET":
        if playlistId is not None:  # Verificar que playlist_id no sea None
            try:
                playlist = Playlist.objects.get(id=playlistId)
                playlist_data = playlist.serializer()  # Usa playlist_data para mantener consistencia
                return JsonResponse({'playlist': playlist_data}, status=200)  # Retorna una sola playlist
            except Playlist.DoesNotExist:
                return JsonResponse({'error': 'Playlist no encontrada.'}, status=404)

        # Si no se especifica playlist_id, devolver todas las playlists
        all_playlists = Playlist.objects.all()
        playlists_data = [playlist.serializer() for playlist in all_playlists]  # List comprehension para simplificar
        return JsonResponse({'playlists': playlists_data}, status=200)

    return JsonResponse({'error': 'Método no permitido.'}, status=405)


@csrf_exempt
def delete_playlist(request, id):
    if request.method == "POST":
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

    if not user.is_authenticated:
        return JsonResponse({"error": "Usuario no autenticado."}, status=401)

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
