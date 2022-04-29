from datetime import datetime
# from msilib.schema import Error
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.http import JsonResponse
from django.utils.safestring import mark_safe
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
import json

from .models import User, Contacts



# Login the User
def login_view(request):
    # POST Login_View Method
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        # Attempt to sign user in
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            # Login successful
            login(request, user)
            # Update online status
            user = User.objects.get(username=request.user)
            user.is_online = 1
            user.save()
            return HttpResponseRedirect('/')
        else:
            # Login Failed
            return render(request, "chatapp/login.html", {
                "message": "Invalid username and/or password."
            })

    # GET Login_View Method
    else:
        logout(request)
        return render(request, "chatapp/login.html")



# Logout the User
def logout_view(request):
    # Update status of user
    try:
        user = User.objects.get(username=request.user)
        user.is_online = 0
        user.last_online = datetime.now()
        user.save()
    except IntegrityError as e:
        print(e)

    # Logout
    logout(request)
    return HttpResponseRedirect('/login')



# User Registration
def register(request):
    # POST Register Method
    if request.method == "POST":
        username = request.POST['username']
        age = request.POST["age"]
        avatar = request.POST["avatar-link"]
        password = request.POST["password"]
        confirmation = request.POST["confirmpassword"]

        # Ensure password matches confirmation
        if password != confirmation:
            return render(request, "chatapp/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(
                username = username,
                age = age,
                avatar = avatar,
                password = password,
                is_online = 1,
                last_online = datetime.now(),
                on_call = 0
            )
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "chatapp/register.html", {
                "message": "Username already taken."
            })
        
        # Login the User
        login(request, user)
        return HttpResponseRedirect('/')

    # GET Register Method
    else:
        return render(request, "chatapp/register.html")



# Index/Home Page
@login_required(login_url='login/')
def index(request):

    contacts = Contacts.objects.filter(user1=request.user)

    # Create contact list
    contact_list = list()
    for contact in contacts:
        contact_list.append(contact.user2)

    # Create new contacts list 
    all_contacts = User.objects.exclude(username=request.user)
    new_contacts = list()
    for contact in all_contacts:
        if contact not in contact_list:
            new_contacts.append(contact)

    # If no contacts are present
    if not contact_list:
        contact_list = "No Contacts Available"

    # If no new users are there to be added
    if not new_contacts:
        new_contacts = "No Users Available"

    print(contacts)

    
    # If new users can be added
    return render(request, 'chatapp/index.html', {
        'username': mark_safe(json.dumps(request.user.username)),
        'user': request.user,
        'contacts': contacts,
        'contact_list': contact_list,
        'available_contacts': new_contacts
    })


# Add Contacts
@csrf_exempt
@login_required(login_url='login/')
def addcontact(request):
    #  If POST request
    if request.method == "POST":
        logged_user = request.user

        data = json.loads(request.body)
        addContacts = data.get("newcontacts")
        # print(f'CONTACTS RECEIVED: {addContacts}')


        if not addContacts:
            # If no new contacts are there to be added
            return JsonResponse({"message": "No Contacts Added."}, status=201)
        else:
            # Add new contacts
            n = 0
            for contact_name in addContacts:
                try:
                    contact = User()
                    contact = User.objects.get(username=contact_name)
                    # Add contact connection for logged user
                    c1 = Contacts(user1=logged_user, user2=contact)
                    c1.save()
                    # Add contact connection for other user
                    c2 = Contacts(user1=contact, user2=logged_user)
                    c2.save()
                    n = n + 1
                    return JsonResponse({"message": f"{n} Contacts Added Successfully."}, status=201)
                
                except IntegrityError as e:
                    print(e)
                    return JsonResponse({"message": "No Contacts Added."}, status=201)
