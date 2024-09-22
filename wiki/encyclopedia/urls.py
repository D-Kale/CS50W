from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<entry>", views.entries, name="entries"),
    path('search/', views.search, name='search'),
    path('create/', views.create, name='create'),
    path('edit/<str:entry>/', views.edit, name='edit'),
    path('random/', views.random_entry, name='random_entry'),
    path('delete/<str:entry>/', views.delete_entry, name='delete')
]
