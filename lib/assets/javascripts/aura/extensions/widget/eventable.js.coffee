define 'aura/extensions/widget/eventable', ->

  'use strict';

  # TODO think how to resolve conflict between componentjs and r.js optmizer
  extend = require 'segmentio-extend'

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

  eventable =
    # TODO pass this extensions to the identifiable extension
    # TODO use widget.extend with the constructor property
    constructor: (options) ->
      matches     = extractor.exec options._ref
      @name       = matches[1]
      @identifier = options.identifier or options.resource or matches[2]

      eventable.super.constructor.call @, options

      @sandbox.identifier = @identifier

      @


  (application) ->

    initialize: (application) ->
      Widgets = application.core.Widgets

      extend Widgets.Base.prototype,
      # TODO implement rivets compatibility, instead of generic
      # binding events, alter html
        handles: (event_name, widget_event_name = event_name, selector = @$el) ->
          unless @name
            message = "Widget name must be provided in order to use handlers, but this.name is '#{@name}' \n"
            message = "Also you may have forgotten to set the type of your widget to 'Base'"
            throw message

          context = @$el unless selector == @$el

          event_name = translations.get(event_name) ? event_name

          @sandbox.dom.find(selector, context).on event_name, create_handler(@, widget_event_name || event_name)

      # TODO replace Base.extend inheritance to stampit composition
      Widgets.Base = Widgets.Base.extend eventable
      eventable.super = Widgets.Base.__super__
