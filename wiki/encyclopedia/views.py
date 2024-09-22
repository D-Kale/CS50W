import random
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from markdown2 import Markdown

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')

        if title and content:
            util.save_entry(title, content)
            return redirect('index')
        else:
            return redirect(create)

    return render(request, 'encyclopedia/create.html')

def edit(request, entry):
    entrylist = util.list_entries()
    content = util.get_entry(entry)

    if entry not in entrylist:
        return render(request, 'encyclopedia/error.html', {
            'entry' : entry
        })

    if request.method == 'POST':
        content = request.POST.get('content')
        if entry and content:
            content = '\n'.join(line.strip() for line in content.splitlines() if line.strip())
            util.save_entry(entry, content)
            return redirect('index')
        else:
            return redirect('edit', entry=entry)

    return render(request, 'encyclopedia/edit.html', {
        "entry": entry,
        "content": content
    })

def delete_entry(request, entry):
    list = util.list_entries()
    for object in list:
        if entry.lower() == object.lower():
            util.delete(entry)
            
    return redirect('index')

def entries(request, entry):
    content_md = util.get_entry(entry)

    if content_md:
        content = Markdown().convert(content_md)
        return render(request, "encyclopedia/especific.html", {
            "entry": entry,
            "content": content
        })
    else:
        return render(request, "encyclopedia/error.html", {
            "entry": entry,
        })

def search(request):
    query = request.GET.get('q', '').lower()
    entries = util.list_entries()

    exactquery = query

    result = []

    for entry in entries:
        if query == entry.lower():
            return redirect('entries', entry=entry)
        
        if query in entry.lower():
            result.append(entry)

    return render(request, 'encyclopedia/search.html', {
        'query': query,
        'results': result,
        "origin" : exactquery
        })

def random_entry(request):
    entries_list = util.list_entries()
    entry = random.choice(entries_list)

    return redirect('entries', entry=entry)