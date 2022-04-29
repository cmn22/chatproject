from django.urls import path
from .views import index, login_view, register, logout_view, addcontact

app_name = 'chatapp'

urlpatterns = [
    path('', index, name='index'),
    path('login/', login_view, name='login'),
    path('register/', register, name='register'),
    path('logout/', logout_view, name='logout'),
    path('addcontact/', addcontact, name='newcontact'),
]
