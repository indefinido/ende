'use strict';

# TODO define componentjs required packages, as requirejs packages
observable   = require('indefinido-observable').mixin

define ->
  (widget) ->

    widget = observable widget

    # TODO transfer data from old scope to new one
    # widget.subscribe 'scope', ->

    enhance_presenter = (presenter) ->
      widget = @
      presenter.presentation         ||= {binders: {}}
      presenter.presentation.binders ||= {}

      {presentation: {binders}} = presenter


      binders['scope-*'] =
        bind: ->
          @scope_name = @args[0].replace /-/g, '_'
        routine: (element, value) ->
          widget.scope_to widget.scope[@scope_name] value

      binders.scope =

        routine: (element, value) ->
          keypath = @keypath.substring 1 if @keypath[0] == '_'
          name = "by_#{@key}_#{keypath || @keypath}"
          widget.scope_to widget.scope[name] value

    enhance_presenter.call widget, widget.presenter
    widget.subscribe 'presenter', enhance_presenter



