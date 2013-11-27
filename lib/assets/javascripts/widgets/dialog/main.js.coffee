'use strict'

define ->

  dialog_extensions =
    show: ->
      @emit 'show'

      {_overlay: overlay} = @

      # overlay
      if overlay
        overlay.show()
        @el.addClass 'model'

      # escapable
      @escapable() if !overlay || overlay.closable

      # position
      @el.removeClass 'hide'
      @el.appendTo 'body'
      @el.css marginLeft: -(this.el.width() / 2) + 'px'

      @emit 'showed'

    render: (options) ->
      {widget}  = options
      {sandbox, $el: el} = widget
      @el = el

      sandbox.inject options.content

      el.find '.close', (event) =>
        @emit 'close'
        @hide()
        event.preventDefault()

      unless options.autoshow
        setTimeout ->
          el.addClass 'hide'
        , 0

  type: 'Base'

  dialog: null

  options:

    autoshow: false
    modal: false

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    # TODO integrate component and requirejs
    dialog  = require('dialog').Dialog
    overlay = require 'component-overlay'
    @sandbox.util.extend dialog.prototype, dialog_extensions

    widget_options = @extract_options()
    @dialog = new dialog
      widget: @,
      autoshow: @options.autoshow
      content: widget_options

    @identifier = widget_options.name if @identifier == 'default'
    @$el.attr 'id', 'dialog'
    @$el.addClass "modal"

    # TODO update dialog and remove this code when issue
    # https://github.com/component/dialog/issues/9 is fixed
    if @options.modal
      @dialog.on 'show', ->
        @_overlay = overlay closable: false
        @_overlay.show()


    @sandbox.on "modal.#{@identifier}.show"   , @dialog.show   , @dialog
    @sandbox.on "modal.#{@identifier}.hide"   , @dialog.hide   , @dialog
    # @sandbox.on "modal.#{@identifier}.overlay", @dialog.overlay, @dialog

    # TODO build a custom presenter for the widget?
    # @presentation = presenter model
    # @bind presentation
    @sandbox.start()

  extract_options: ->
    options =  _.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'

    dynamic_options = _.omit options, Object.keys(@constructor.__super__.options)

    keys = Object.keys dynamic_options
    throw new TypeError "Too many keys on options object! #{keys.join(', ')}" unless keys.length == 1

    widget_options        = dynamic_options[keys[0]]
    widget_options.name ||= keys[0]
    widget_options.el     = @$el

    widget_options

