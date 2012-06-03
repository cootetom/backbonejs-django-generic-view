from django import forms

from models import ToDo


class ToDoForm(forms.ModelForm):
    class Meta:
        model = ToDo