/*jshint curly: true, eqeqeq: true, undef:true, devel: true, browser: true, jquery: true, strict: false, loopfunc: true */
/*global Backbone */

/**
*	Simple ToDo list app that uses backbonejs and Django.
*
*	Coded by: Tom Coote (http://tomcoote.co.uk)
*	Date: 4th June 2012
*/

(function() {
	
	/**
	* Responsible for the storage of a ToDo item. Backbonejs
	* does all the hard work sening CRUD signals to a Django URL.
	*/
	var ToDoModel = Backbone.Model.extend({
		urlRoot: '/todo_crud',
		
		validate: function(attrs) {
			if (!attrs.description) {
				return 'Please provide a description for your ToDo item';
			}
		}
	});
	
	/**
	* Responsible for a single ToDo item in the DOM. This will
	* allow the DOM element to be marked as done, edited or deleted by the user.
	* The ToDoModel is updated and saved with any changes made by the user.
	*/
	var ToDoView = Backbone.View.extend({
		tagName: 'li',
		
		events: {
			'dblclick .description': 'allowEdit',
			'keypress .edit': 'edit',
			'click .doneChk': 'toggleDone',
			'click .delete': 'deleteItem'
		},
		
		initialize: function() {
			this.model.bind('sync', this.render, this);
		},
		
		render: function () {
			var that = this;
			if (this.model.id) {
				$.get('/todo_render_single/' + this.model.id, function(r) {
					var oldEl = that.$el;
					that.setElement($(r));
					$(oldEl).replaceWith(that.$el);
				});
			}
			return this;
		},
		
		allowEdit: function() {
			this.$el.addClass('editing').children('.edit').focus();
		},
		
		edit: function(e) {
			if (e.keyCode === 13) {
				this.model.save({
					description: this.$el.children('.edit').val()
				}, {
					error: function(model, error) {
						alert(error);
					}
				});
			}
		},
		
		toggleDone: function() {
			this.model.save({done: this.$el.children('.doneChk').is(':checked')});
		},
		
		deleteItem: function() {
			if (confirm('Are you sure?')) {
				this.model.destroy();
				this.model.clear();
				var $el = this.$el;
				$el.fadeOut(function() { $el.remove(); });
			}
		}
	});
	
	/**
	* Resposible for getting the complete list of ToDo's from the server
	* and creating models for each here.
	*/ 
	var ToDoCollection = Backbone.Collection.extend({
		model: ToDoModel,
		url: '/todo_crud'
	});
	
	/**
	* Responsible for rendering the complete list of tasks when the app starts and
	* allows a new task to be added to the list.
	*/
	var ToDoListView = Backbone.View.extend({
		el: '#todoapp',
		
		initialize: function() {
			this.render();
		},
		
		events: {
			'keypress #newItem': 'createToDo'
		},
		
		createToDo: function(e) {
			if (e.keyCode === 13) {
				var todo = new ToDoModel(),
					that = this;
					
				todo.save({
						description: $('#newItem').val(),
						done: false
					}, {
						success: function() {
							var view = new ToDoView({model: todo});
							view.render();
							$('#todoList').append(view.$el);
							$('#newItem').val('');
						},
						error: function(model, error) {
							alert(error);
						}
					});
			}
		},
		
		render: function () {
			var that = this;
			var todos = new ToDoCollection();
			todos.fetch({
				success: function(todos) {
					$.get('/todo_render_all/', function(r) {
						$('#todoList').html(r);
						
						todos.each(function(m) {
							new ToDoView({
								el: $('#todo' + m.id),
								model: m
							});
						});
					});
				}
			});
		}
	});
	window.toDoList = new ToDoListView();
	
})();