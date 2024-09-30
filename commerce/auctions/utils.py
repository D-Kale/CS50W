from django.db.models import Avg
from django.contrib import messages
from .models import Bid, Category, Listing, Stars

def get_average_stars(listing):
    stars = Stars.objects.filter(listing=listing)
    average_stars = stars.aggregate(Avg('stars'))['stars__avg']
    return round(average_stars, 1) if average_stars is not None else 0

def is_user_in_watchlist(user, listing):
    return user in listing.watchlist.all()

def get_user_star_rating(user, listing):
    try:
        return Stars.objects.get(user=user, listing=listing).stars
    except Stars.DoesNotExist:
        return None

def validate_star_value(stars_value):
    if stars_value < 1 or stars_value > 5:
        return False
    return True

def add_message(request, level, message):
    if level == 'error':
        messages.error(request, message)
    elif level == 'success':
        messages.success(request, message)

def create_listing(title, description, image, price, category, currentUser):
    categorydata = Category.objects.get(categoryName=category)
    bid = Bid(bid=int(price), user=currentUser)
    bid.save()

    newListing = Listing(
        title=title,
        description=description,
        imageUrl=image,
        price=bid,
        category=categorydata,
        owner=currentUser
    )
    newListing.save()
