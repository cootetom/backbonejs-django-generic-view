from django.conf.urls.defaults import patterns
from django.views.generic import TemplateView

from views import ToDoModelView

urlpatterns = patterns('todos.views',
    (r'^$', TemplateView.as_view(template_name='todos/index.html')),
    
    # backbonejs CRUD end points.
    (r'^todo_crud/?$', ToDoModelView.as_view()),
    (r'^todo_crud/(?P<pk>\d+)/?$', ToDoModelView.as_view()),
    
    # Used in backbonejs render functions.
    (r'^todo_render_all/?$', 'todo_render_all'),
    (r'^todo_render_single/(?P<pk>\d+)/?$', 'todo_render_single'),
)  