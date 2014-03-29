define ->

  # TODO create diferent type for non-ui composable widgets
  # TODO think about how to make this widget dependent on eventable extension
  # TODO move this widtet to an extension when element is stored in the sandbox
  type: 'Base'

  version: '0.1.0'

  initialize: (options) ->

    @sandbox._attachments = []

    # TODO think how to extend widgets as a way of knowing all children have started
    @compose_when_parent()

  # TODO think how to extend widgets as a way of knowing all children have started
  compose_when_parent: ->
    @interval = setInterval =>
      if @sandbox._parent?
        @compose @sandbox._parent._widget
        clearInterval @interval
    , 800

  # Create a widget type to replace @$el for a html comment
  compose: (parent) ->
    parent_namespace = parent.name + '.' + parent.identifier

    @sandbox.on "#{parent_namespace}.reattach", @reattach, @
    @sandbox.on "#{parent_namespace}.detach"  , @detach  , @
    @sandbox.on "#{parent_namespace}.attach"  , @attach  , @


  reattach: (selector) ->
    @detach()
    @attach selector

  detach: ->
    @sandbox.stopListening()
    # TODO Support multiple deatachments events storage
    current_events   = @sandbox._events
    @sandbox._events = @sandbox._attachments.shift() || []
    @sandbox._attachments.push current_events

    # TODO unbind and store jquery handlers
    # TODO store element position in the attachment
    @$el.detach()

  attach: (selector) ->
    element = @sandbox.dom.find selector
    throw new TypeError "attach: No element found for #{selector} for attachment" unless element.length

    # TODO Support multiple deatachments events storage
    @sandbox._attachments.push @sandbox._events
    @sandbox._events = @sandbox._attachments.shift() || []
    @sandbox.startListening()

    # TODO rebind jquery handlers
    # TODO restore element position of the attachment
    element.append @$el