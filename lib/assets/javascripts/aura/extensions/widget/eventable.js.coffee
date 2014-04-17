'use strict';

define 'aura/extensions/widget/eventable', ['stampit', 'es6-map-shim'], (stampit) ->

  extractor = /.*?\$(.*?)@(.*?)\+(.*?)/

  translations = new Map()
  translations.set 'transition.end',
    'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend'

  translations.set 'transition.start',
    'webkitTransitionStart otransitionstart oTransitionStart msTransitionStart transitionstart'

  translations.set 'animation.end',
    'webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend'

  translations.set 'animation.start',
    'webkitAnimationStart oanimationstart oAnimationStart msAnimationStart animationstart'

  # TODO better support for custom event handlers
  create_handler = (widget, event_name) ->
    (event) ->
      widget.sandbox.emit "#{widget.name}.#{widget.identifier}.#{event_name}ed", @
      event.preventDefault()
      false

  eventable = stampit
    # TODO implement rivets compatibility, instead of generic
    # binding events, alter html
    handles: (event_name, widget_event_name = event_name, selector = @$el) ->
      unless @name
        message  = "Widget name must be provided in order to use handlers, but this.name is '#{@name}' \n"
        message += "Also you may have forgotten to set the type of your widget to 'Base'"
        throw new TypeError message

      context = @$el unless selector == @$el

      event_name = translations.get(event_name) ? event_name

      @sandbox.dom.find(selector, context).on event_name, create_handler(@, widget_event_name || event_name)

    before_initialize: ->
      matches     = extractor.exec @options._ref
      @name       = matches[1]
      @identifier = @options.identifier or @options.resource or matches[2]
      @sandbox.identifier = @identifier

  version: '0.1.0'

  initialize: (application) ->
    application.core.Widgets.Base.compose eventable

    {core: {mediator}} = application
    application.sandbox.startListening = ->
      # TODO @listening = true
      mediator.on event.name, event.callback for event in @_events

      true




