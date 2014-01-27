'use strict';

# TODO define componentjs required packages, as requirejs packages
observable   = require('indefinido-observable').mixin

define ->
  (widget) ->

    widget = observable widget

    # TODO transfer data from old scope to new one
    # widget.subscribe 'scope', ->

    forward_scope_data = (scope_name, data) ->
      switch widget.scope['$' + scope_name].constructor
        when Array
          data = [data] unless $.type(data) == 'array'
          widget.scope[scope_name] data...
        else
          widget.scope[scope_name] data


    enhance_presenter = (presenter) ->
      widget = @
      presenter.presentation         ||= {binders: {}}
      presenter.presentation.binders ||= {}

      {presentation: {binders}} = presenter


      binders['scope-*'] =

        bind: ->
          @scope_name = @args[0].replace /-/g, '_'
        forward_scope_data: forward_scope_data
        routine: (element, value) ->
          # TODO better way to wait other possible scope propagations
          # _.defer =>
          widget.scope_to @binder.forward_scope_data @scope_name, value

      binders.scope =

        forward_scope_data: forward_scope_data

        routine: (element, value) ->
          keypath = @keypath.substring 1 if @keypath[0] == '_'
          name = "by_#{@key}_#{keypath || @keypath}"

          # TODO better way to wait other possible scope propagations
          #_.defer =>
          widget.scope_to @binder.forward_scope_data @scope_name, value


    enhance_presenter.call widget, widget.presenter
    widget.subscribe 'presenter', enhance_presenter



