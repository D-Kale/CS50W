from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.decorators import login_required

from django.db.models import Avg

from .models import Bid, Category, Listing, User, Comment, Stars


def index(request):
    allCategories = Category.objects.all()
    selected_category = request.GET.get('category')

    if selected_category:
        allListings = Listing.objects.filter(isActive=True, category__categoryName=selected_category)
    else:
        allListings = Listing.objects.filter(isActive=True)

    allListings = allListings.annotate(average_stars=Avg('listingStars__stars'))

    return render(request, "auctions/index.html", {
        "listings": allListings,
        "categories": allCategories,
        "selected_category": selected_category
    })

@login_required(login_url='login')
def stars(request, id):
    listingdata = Listing.objects.get(pk=id)
    stars_value = int(request.POST['stars'], 0)
    currentuser = request.user

    if stars_value > 5 or stars_value < 1:
        messages.error(request, "This is not an avalible cantity of stars")

    try:
        existingstar = Stars.objects.get(user = currentuser, listing = listingdata)

        existingstar.stars = stars_value
        existingstar.save()
    except Stars.DoesNotExist:
        new_star = Stars(stars=stars_value, user=currentuser, listing=listingdata)
        new_star.save()

    return redirect('listing', id=id)

@login_required(login_url='login')
def create(request):
    if request.method == "GET":
        allCategories = Category.objects.all()
        return render(request, "auctions/create.html", {
            "categories": allCategories,
        })
    else:
        name = request.POST['title']
        desc = request.POST['description']
        image = request.POST['image']
        price = request.POST['price']
        category = request.POST['category']

        currentUser = request.user
        categorydata = Category.objects.get(categoryName=category)

        bid = Bid(bid=int(price), user=currentUser)
        bid.save()

        newListing = Listing(
            title = name,
            description = desc,
            imageUrl = image,
            price = bid,
            category = categorydata,
            owner = currentUser
        )

        newListing.save()

        return HttpResponseRedirect(reverse(index))

@login_required(login_url='login')
def displayWatchlist(request):
    currentUser = request.user
    listings = currentUser.listingWatchlist.all()

    watchlist_ids = set(listings.values_list('id', flat=True))
    
    return render(request, "auctions/watchlist.html", {
        "listings": listings,
        "isListingInWatchlist": watchlist_ids,
    })

@login_required(login_url='login')
def watchlist(request, id):
    listingData = Listing.objects.get(pk = id)
    currentUser = request.user

    if currentUser in listingData.watchlist.all():
        listingData.watchlist.remove(currentUser)
    else:
        listingData.watchlist.add(currentUser)
    
    from_page = request.POST.get('from_page')

    if from_page == 'watchlist':
        return HttpResponseRedirect(reverse("watchlist"))
    else:
        return HttpResponseRedirect(reverse("listing", args=(id, )))

@login_required(login_url='login')
def listing(request, id):
    listingData = Listing.objects.get(pk=id)
    isListingInWatchlist = request.user in listingData.watchlist.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username

    stars = Stars.objects.filter(listing=listingData)
    
    average_stars = stars.aggregate(Avg('stars'))['stars__avg']

    try:
        user_star = Stars.objects.get(user=request.user, listing=listingData).stars
    except Stars.DoesNotExist:
        user_star = None


    if average_stars is None:
        average_stars = 0

    return render(request, "auctions/listing.html", {
        "listing": listingData,
        "isListingInWatchlist": isListingInWatchlist,
        "allComments": allComments,
        "isOwner": isOwner,
        "starRate": round(average_stars, 1),
        "user_star": user_star
    })

@login_required(login_url='login')
def addBid(request, id):
    newBid = int(request.POST['newBid'])
    listingData = Listing.objects.get(pk=id)

    if newBid > listingData.price.bid:
        updateBid = Bid(user=request.user, bid=newBid)
        updateBid.save()
        listingData.price = updateBid
        listingData.save()
        messages.success(request, "Bid was updated successfully")
    else:
        messages.error(request, "Bid was updated failed")

    return redirect('listing', id=id)

@login_required(login_url='login')
def closeAuction(request, id):
    listingData = Listing.objects.get(pk=id)
    listingData.isActive = False
    listingData.save()
    isOwner = request.user.username == listingData.owner.username
    isListingInWatchlist = request.user in listingData.watchlist.all()
    allComments = Comment.objects.filter(listing=listingData)
    return render(request, "auctions/listing.html", {
        "listing": listingData,
        "isListingInWatchlist": isListingInWatchlist,
        "allComments": allComments,
        "isOwner": isOwner,
        "update": True,
        "message": "Congratulations! Your auction is closed."
    })

@login_required(login_url='login')
def addComment(request, id):
    currentUser = request.user
    listingData = Listing.objects.get(pk=id)
    message = request.POST['newComment']

    newComment = Comment(
        author = currentUser,
        listing = listingData,
        message = message
    )

    newComment.save()

    return HttpResponseRedirect(reverse("listing", args=(id, )))



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

