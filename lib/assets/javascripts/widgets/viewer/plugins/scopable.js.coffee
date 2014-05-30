'use strict';

define ['stampit/stampit', 'observable'], (stampit, observable) ->

  scopingable = stampit
    start: ->
      deferred = @widget.sandbox.data.deferred()

      # Update the scope after resolution
      deferred.done ->
        for scope_name, data of @widget.scopings
          @widget.forward_scope_data scope_name, data

        # TODO think of a better method name than repopulate
        @widget.repopulate()

      @deferred = deferred

    reset: ->
      @start()

    # TODO move bindings logic to here
    enqueue: (scope_name, value) ->
      @widget.scopings[scope_name] = value
  ,
    deferred: null
    scopings: null
  , ->

    @widget.scopings ||= {}

    # Resolve scopings after scoping has ended
    @resolve = _.debounce =>
      @deferred.resolveWith @, [@scopings]
      @reset()

    @


  scopable = stampit
    forward_scope_data: (scope_name, data) ->
      switch @scope['$' + scope_name].constructor
        when Array
          data = [data] unless $.type(data) == 'array'
          @scope[scope_name] data...
        else
          @scope[scope_name] data

    scopable_presentation_options: (options) ->
      widget    = @
      scoping   = scopingable widget: @
      scoping.start()

      # Update presenter interface to support binders customization
      options.presentation         ||= {binders: {}}
      options.presentation.binders ||= {}
      {presentation: {binders}}      = options

      # Create custom bindings for this scope, for storing scope
      # changes per widget instance
      binders['scope-*'] =
        bind: ->
          @scope_name = @args[0].replace /-/g, '_'
          @widget = widget
        routine: (element, value) ->
          scoping.enqueue @scope_name, value
          scoping.resolve()

      binders.scope =
        bind: ->
          @widget = widget
        routine: (element, value) ->
          keypath = @keypath.substring 1 if @keypath[0] == '_'
          name = "by_#{@key}_#{keypath || @keypath}"

          scoping.enqueue name, value
          scoping.resolve()


    ,
      scopings: null
    , ->

      observable @widget

      # TODO compose this factory with the widget factory instead of
      # creating a new instance and merging methods
      stampit.mixIn @widget, scopable.fixed.methods

      # TODO transfer data from old scope to new one
      # widget.subscribe 'scope', ->

      # TODO @widget.scopings = scopings = []
      @widget.scopings = {}
      @scopable_presentation_options.call @widget, @widget.options

      @widget


  (widget) -> scopable widget: widget




