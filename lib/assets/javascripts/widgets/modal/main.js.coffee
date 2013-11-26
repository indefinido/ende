'use strict'

define ->

  dialog_extensions =
    render: (options) ->
      {widget}  = options
      {sandbox} = widget

      @el = widget.$el
      sandbox.inject options.content

      @el.find '.close', (event) =>
        @emit 'close'
        @hide()
        event.preventDefault()

  type: 'Base'

  dialog: null

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    # TODO integrate component and requirejs
    dialog  = require('dialog').Dialog

    @sandbox.util.extend dialog.prototype, dialog_extensions

    @dialog = new dialog
      widget: @,
      content: @extract_options()

    @$el.attr 'id', 'dialog'
    @$el.addClass 'modal'

    # TODO update dialog and remove this code when issue
    # https://github.com/component/dialog/issues/9 is fixed
    @dialog.on 'show', ->
      @el.removeClass 'hide'

    # TODO build a custom presenter for the widget?
    # @presentation = presenter model
    # @bind presentation

    @sandbox.start @el
  started: ->
    debugger

  extract_options: ->
    widget_options =  _.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'

    keys = Object.keys widget_options
    throw new TypeError "Too many keys on options object! #{keys.join(', ')}" unless keys.length == 1

    widget_options        = @options[keys[0]]
    widget_options.name ||= keys[0]
    widget_options.el     = @$el

    widget_options

