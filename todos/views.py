from django.shortcuts import render

from backbonejs.views import BackbonejsModelView
from models import ToDo
from forms import ToDoForm
    

class ToDoModelView(BackbonejsModelView):
    '''To handle the CRUD signals from backbonejs.'''
    model = ToDo
    form = ToDoForm
    fields = ['id', 'description', 'done']
    
    
def todo_render_all(request):
    '''Return the complete list of ToDo's from the database as HTML.'''
    return render(request, 'todos/items_list.html', {
                            'items': ToDo.objects.all()
                            })
    
def todo_render_single(request, pk):
    '''Return a single ToDo from the database as HTML.'''
    return render(request, 'todos/item.html', {
                            'item': ToDo.objects.get(pk=pk)
                            })
    
    