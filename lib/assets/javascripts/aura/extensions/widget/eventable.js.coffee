define 'aura/extensions/widget/eventable', ->

  'use strict';

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


  create_handler = (widget, event_name) ->
    (event) ->
      widget.sandbox.emit "#{widget.name}.#{widget.identifier}.#{event_name}ed", @
      event.preventDefault()
      false


  (application) ->

    initialize: (application) ->

      extend application.core.Widgets.Base.prototype,
      # TODO implement rivets compatibility, instead of generic binding events, alter html
        handles: (event_name, widget_event_name = event_name, selector = @$el) ->
          unless @name
            message = "Widget name must be provided in order to use handlers, but this.name is '#{@name}' \n"
            message = "Also you may have forgotten to set the type of your widget to 'Base'"
            throw message

          context = @$el unless selector == @$el

          event_name = translations.get(event_name) ? event_name

          @sandbox.dom.find(selector, context).on event_name, create_handler(@, widget_event_name || event_name)

      parent = application.core.Widgets.Base

      # TODO pass this extensions to the identifiable extension
      eventableize = (options) ->
        matches     = extractor.exec options._ref
        @name       = matches[1]
        @identifier = options.resource ? matches[2]

        parent.call @, options

        @sandbox.identifier = @identifier

        @

      eventableize.prototype        = new parent _ref: ''
      extend eventableize, parent
      application.core.Widgets.Base = eventableize


