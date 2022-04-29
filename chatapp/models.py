from datetime import datetime
from pydoc import describe
from django.db import models
from django.contrib.auth.models import AbstractUser


# User Model
class User(AbstractUser):
    age = models.PositiveSmallIntegerField()
    avatar = models.URLField(max_length=250)
    is_online = models.BooleanField(blank=True, null=True)
    last_online = models.DateTimeField(blank=True, null=True)
    on_call = models.BooleanField(blank=True, null=True)

    def serialize(self):
        return {
            "username": self.username,
            "avatar": self.avatar,
            "timestamp": self.last_login,
        }


# User Contacts (for Personal Messaging)
class Contacts(models.Model):
    user1 = models.ForeignKey(User, related_name='person', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    # unread = models.IntegerField(default=0, blank=True, null=True)
    # last_message = models.TextField(default="No messages", blank=True, null=True)
    # last_message_time = models.TextField(default=datetime.now().strftime("%d/%m/%Y, %H:%M"))

    def __str__(self):
        return f'{self.user1.username} is in contact with {self.user2.username}'


# Personal Chat Message
class Chat_Messages(models.Model):
    sender = models.ForeignKey(User, related_name='author_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, blank=True)
    is_message = models.BooleanField(default=True)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.sender.username} to {self.receiver.username}'

    def last_10_messages():
        return Chat_Messages.objects.order_by('-timestamp').all()[:10]


# # Group Details
# class Groups(models.Model):
#     name = models.TextField(max_length=20)
#     description = models.TextField(max_length=100)
#     admin = models.ForeignKey(User, related_name='admin', on_delete=models.CASCADE)

#     def __str__(self):
#         return f'{self.name} is owned by {self.admin.username}'


# # Group User Details
# class Group_Users(models.Model):
    # group = models.ForeignKey(Groups, related_name='group', on_delete=models.CASCADE)
    # user = models.ForeignKey(User, related_name='user', on_delete=models.CASCADE)    

#     def __str__(self):
#         return f'{self.user.username} is a part of by {self.group.name}'


# # Group Message
# class Group_Messages(models.Model):
#     sender = models.ForeignKey(User, related_name='author_messages', on_delete=models.CASCADE)
#     group = models.ForeignKey(Groups, on_delete=models.CASCADE, blank=True)
#     is_message = models.BooleanField(default=True)
#     message = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f'Message from {self.sender.username} to {self.group.name}'

#     def last_10_messages():
#         return Group_Messages.objects.order_by('-timestamp').all()[:10]

