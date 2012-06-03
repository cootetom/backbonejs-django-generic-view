(function() {
	Backbone.emulateHTTP = true;
	
	// Todo
	var Todo = Backbone.Model.extend({
		toggle: function() {
			this.save({done: !this.get('done')});
		},
		
		clear: function() {
			this.destroy();
			$(this.view.el).dispose();
		}
	});
	
	// Todo List
	var TodoList = Backbone.Collection.extend({
		el: $('#todoList'),
		model: Todo,
		url: '/collection/',
		
		render: function() {
			var that = this;
			$.get('/items_list/', function(r) {
				that.el.html(r);
				
			});
			return this;
		}
	});
	var Todos = new TodoList();
	
	var TodoView = Backbone.View.extend({
		tagName: 'li',
		className: 'todo',
  
		events: {
			"click .todo-check"      : "toggleDone",
			"dblclick .todo-content" : "edit",
			"click .todo-destroy"    : "clear",
			"keypress .todo-input"   : "updateOnEnter"
		},
    
		initialize: function() {
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			this.model.view = this;
		},
  
		render: function(callback) {
			$.get('/item/template/' + this.model.id, function(r) {
				this.el = $(r);
				callback(this.el);
			});
			return this;
		},
 
		toggleDone: function() {
			this.model.toggle();
		},
  
		edit: function() {
			$(this.el).addClass('editing');
		},
  
		updateOnEnter: function(e) {
			if (e.code != 13) return;
			this.model.save({content: this.$('.todo-input').getProperty('value')});
			$(this.el).removeClass("editing");
		},
    
		clear: function() {
			this.model.clear();
		}
	});

	// Main app
	var AppView = Backbone.View.extend({
		el: $('#todoapp'),
		
		events: {
			'keypress #newItem' : 'createOnEnter'
		},
		
		initialize: function() {
			_.bindAll(this, 'addOne', 'addAll');
			
			this.input = this.$('#newItem');

			Todos.bind('add', this.addOne);
			Todos.bind('refresh', this.addAll);
			
			Todos.fetch();
			Todos.render();
		},

		addOne: function(todo) {
			new TodoView({model: todo}).render(function(el) {
				$('#todoList').append(el);
			});
		},
    
		addAll: function() {
			Todos.each(this.addOne);
		},
		
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			Todos.create({
				description: this.$el.val(),
				done: false
			});
			this.$el.val('');
		}
	});
	
	window.ToDoApp = new AppView();
})();