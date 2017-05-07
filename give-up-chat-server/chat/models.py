from __future__ import unicode_literals

from django.db import models


# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=16, null=False, blank=False)
    password = models.CharField(max_length=16, null=False, blank=False)
    token = models.CharField(max_length=40, null=True)


class Permiselist(models.Model):
    userid = models.ForeignKey(User, related_name='from+')
    touserid = models.ForeignKey(User, related_name='to+', null=True)
    own_permiseid = models.CharField(max_length=40, null=False, blank=False)
    opposite_permiseid = models.CharField(max_length=40, null=False, blank=False)
    data = models.TextField(null=True, blank=True)
