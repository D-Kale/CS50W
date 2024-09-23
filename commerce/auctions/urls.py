from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("create", views.create, name="create"),
    path("whatchlist/", views.displayWatchlist, name='watchlist'),
    path('watchlistFunction/<int:id>/', views.watchlist, name='watchlistFunction'),
    path("listing/<int:id>/", views.listing, name="listing"),
    path("addBid/<int:id>", views.addBid, name="addBid"),
    path("closeAuction/<int:id>", views.closeAuction, name="closeAuction"),
    path("addComment/<int:id>", views.addComment, name="addComment"),
    path("stars/<int:id>", views.stars, name="stars")
]
