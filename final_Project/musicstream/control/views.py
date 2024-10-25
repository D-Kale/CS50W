from django.shortcuts import render

# Create your views here.
def login(request):
    return render(request, "control/login.html")

def index(request):
    return render(request, "control/index.html")