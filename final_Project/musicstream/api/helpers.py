import os
from mutagen import File, MutagenError
from django.conf import settings

def SaveSong(song):
    """Guarda el archivo de audio y retorna la ruta relativa del archivo."""
    
    # Crea el directorio 'audios' si no existe
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'audios')
    os.makedirs(upload_dir, exist_ok=True)

    # Prepara la ruta del archivo
    base_name, ext = os.path.splitext(song.name)
    file_path = os.path.join(upload_dir, song.name)

    # Evita sobrescribir archivos existentes
    counter = 1
    while os.path.exists(file_path):
        file_path = os.path.join(upload_dir, f"{base_name}-{counter}{ext}")
        counter += 1

    # Guarda el archivo
    try:
        with open(file_path, 'wb+') as dest:
            for chunk in song.chunks():
                dest.write(chunk)

        # Verifica si el archivo es válido
        File(file_path)  # Lanza un error si el archivo está corrupto

    except (MutagenError, IOError):
        os.remove(file_path)  # Elimina el archivo si hay error
        raise ValueError("El archivo de audio está corrupto o no es válido.")

    # Retorna la ruta relativa al directorio MEDIA_ROOT, eliminando el primer 'audios/' extra
    relative_path = os.path.relpath(file_path, settings.MEDIA_ROOT)
    return relative_path  # Retorna la ruta relativa del archivo guardado


def GetDuration(file_path):
    """Obtiene la duración del archivo de audio."""
    audio = File(file_path)
    return audio.info.length