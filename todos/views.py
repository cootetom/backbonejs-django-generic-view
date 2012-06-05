from backbonejs.views import BackbonejsModelView
from models import ToDo
from forms import ToDoForm
    

class ToDoModelView(BackbonejsModelView):
    '''To handle the CRUD signals from backbonejs.'''
    model = ToDo
    form = ToDoForm
    fields = ['id', 'description', 'done']
    
    