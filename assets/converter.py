import os
import json
import time
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC
from PIL import Image
from io import BytesIO
import math
from colorama import Fore, Style
from rich import print
import pyfiglet
from urllib.parse import quote

def extract_metadata(mp3_path):
    audio = MP3(mp3_path, ID3=ID3)
    metadata = {
        "song": os.path.splitext(os.path.basename(mp3_path))[0],
        "artist": str(audio.get("TPE1", "Unknown Artist")),
        "duration": math.ceil(audio.info.length)
    }
    for tag in audio.tags.values():
        if isinstance(tag, APIC):
            image = Image.open(BytesIO(tag.data))
            png_path = os.path.splitext(mp3_path)[0] + ".png"
            image.save(png_path, "PNG")
            metadata["cover"] = png_path
            break
    return metadata

def process_music_folder(folder_path):
    song_list = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".mp3"):
            mp3_path = os.path.join(folder_path, filename)
            metadata = extract_metadata(mp3_path)
            encoded_filename = quote(filename)
            metadata["url"] = f"https://r2.ch3n.cc/songs/{encoded_filename}"
            metadata["cover"] = f"https://r2.ch3n.cc/songs/{quote(os.path.splitext(filename)[0])}.png"
            song_list.append(metadata)
    return song_list

def save_metadata_to_json(song_list, json_path):
    with open(json_path, 'w') as json_file:
        json.dump(song_list, json_file, indent=2)

if os.name == 'nt':
    os.system('cls')
else:
    os.system('clear')

title = pyfiglet.figlet_format('Meta grabber', font='puffy', justify="center")
print(f'[bold magenta]{title}[/bold magenta]')
print(f'[green]Created by [/green][bold cyan]Rednotsus[/bold cyan]')
print("      ")
print("       ")

start_time = time.time()
music_folder = os.path.join(os.getcwd(), "songs")  

if not os.path.exists(music_folder):
    print(f"[bold red][ ERROR ]  |  The directory 'songs' does not exist.")
    exit()

print(f"[yellow][ DETECTOR ]  |  Scanning files in dir")
time.sleep(1)
song_list = process_music_folder(music_folder)
print("      ")
print(f"[yellow][ RENAMER ]  Processed {len(song_list)} songs |  Saving metadata to JSON.")
print("      ")
time.sleep(1)

save_metadata_to_json(song_list, os.path.join(music_folder, "songlist.json"))

elapsed_time = round(float(time.time() - start_time), 2)
print(f"[green][ RENAMER ]  |  Done, Completed in {elapsed_time} seconds")
print(f"[green][ RENAMER ]  |  Press enter to quit...")
input(f"    >    ")
if input == " ":
    if os.name == 'nt':
        os.system('cls')
    else:
        os.system('clear')
    time.sleep(0.5)
    exit()