define ->

  # TODO create diferent type for non-ui composable widgets
  # TODO think about how to make this widget dependent on eventable extension
  # TODO move this widtet to an extension when element is stored in the sandbox
  type: 'Base'

  version: '0.1.0'

  # TODO options: {state: 'reset' # Will preserve initial widget state }

  initialize: (options) ->

    @sandbox._attachments = []

    @$el.addClass "widget #{@name} composing"

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
    @parent = parent
    parent_namespace = parent.name + '.' + parent.identifier

    # TODO move to elementless widgets
    @transform_into_elementless()

    @sandbox.on "#{parent_namespace}.reattach", @reattach, @
    @sandbox.on "#{parent_namespace}.detach"  , @detach  , @
    @sandbox.on "#{parent_namespace}.attach"  , @attach  , @

  transform_into_elementless: ->
    serializable_options = _.omit @options, '$el', 'el', 'ref', '_ref', 'require', 'baseUrl'

    marker  = " #{@name}.#{@identifier} for #{@parent.name}.#{parent.identifier}"
    marker += " with #{JSON.stringify serializable_options} "
    node    = document.createComment marker
    @$el.replaceWith node

    @$el = $ node

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
    @parent.$el.detach()

  attach: (selector) ->
    element = @sandbox.dom.find selector
    @sandbox.logger.error "attach: No element found for #{selector} for attachment" unless element.length

    # TODO Support multiple deatachments events storage
    @sandbox._attachments.push @sandbox._events
    @sandbox._events = @sandbox._attachments.shift() || []
    @sandbox.startListening()

    # TODO rebind jquery handlers
    # TODO restore element position of the attachment
    element.append @parent.$el