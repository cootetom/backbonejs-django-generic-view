from django.db import models


class ToDo(models.Model):
    '''Represents a single ToDo item.'''
    description = models.CharField(max_length=250)
    done = models.BooleanField()
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created']
    