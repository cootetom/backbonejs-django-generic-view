from django.views.generic import View
from django.utils import simplejson
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers.python import Serializer as PythonSerializer
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models.query import QuerySet

class BackbonejsModelView(View):
    '''
    Used as a base class for Django views that are responsible for handling the 
    CRUD signals sent from backbonejs using JSON.
    
    Attributes
    ----------
    model : The model class that your view is responsible for manipulating.
    
    form : Can be None but if used then data must validate before commiting to the database.
    
    fields : A list of attribute names in the model class that will be returned as JSON to
             backbonejs. If this is None then all attributes are returned.
    '''
    model = None
    form = None
    fields = None
    
    def dispatch(self, request, *args, **kwargs):
        '''
        This function will deserialize the JSON data sent from backbonejs into
        the request so that our REST functions can access it. It will then serialize
        the data sent back from REST functions into JSON and send back to backbonejs
        in the response.
        '''
        try:
            request.DATA = simplejson.loads(request.raw_post_data)
        except:
            request.DATA = None
            
        query_set = super(BackbonejsModelView, self).dispatch(request, *args, **kwargs)
        if query_set is None:
            return HttpResponse('', status=400)
        
        # If the REST function returns only one model instance then we should
        # serialize only that but the PythonSerializer requires a list so put
        # it into a list and change it back to an object after PythonSerializer.
        return_single_obj = False
        if not isinstance(query_set, QuerySet):
            query_set = [query_set]
            return_single_obj = True
            
        # We need to modify the hash of data that PythonSerializer creates into something
        # that backbonejs will understand.
        obj_set = PythonSerializer().serialize(query_set)
        backbonejs_set = []
        for obj in obj_set:
            m = {}
            if self.fields is None or 'id' in self.fields or 'pk' in self.fields:
                m['id'] = obj['pk']
            for k, v in obj['fields'].items():
                if self.fields is None or k in self.fields:
                    m[k] = v
            backbonejs_set.append(m)
            
        if return_single_obj:
            backbonejs_set = backbonejs_set[0]
        
        response = HttpResponse(simplejson.dumps(backbonejs_set, ensure_ascii=False, cls=DjangoJSONEncoder), 
                                mimetype='application/json')
        return response
    
    def get(self, request, pk=None):
        '''Return either a single object if pk is given or all objects in the database.'''
        if pk is not None:
            return get_object_or_404(self.model, pk=pk)
        else:
            return self.model.objects.all()
    
    def post(self, request):
        '''Create a new object. Validate using a form if required. Return the created object.'''
        if self.form is not None:
            form = self.form(request.DATA)
            if form.is_valid():
                return form.save()
            else:
                return None
            
        return self.model.objects.create(**request.DATA)
    
    def put(self, request, pk):
        '''Update an existing object. Validate using a form if required. Return the updated object.'''
        item = get_object_or_404(self.model, pk=pk)
        
        if self.form is not None:
            form = self.form(request.DATA, instance=item)
            if form.is_valid():
                return form.save()
            else:
                return None
        
        for k, v in request.DATA.items():
            setattr(item, k, v)
        item.save()
        return item
    
    def delete(self, request, pk):
        '''Delete a single object. Return the deleted object.'''
        item = get_object_or_404(self.model, pk=pk)
        item.delete()
        return item
    
    
