'use strict'

define ->

  dialog_extensions =
    positionate: ->
      @el.css marginLeft: -(this.el.width() / 2) + 'px'

    show: ->
      @emit 'show'

      {_overlay: overlay} = @

      # overlay
      if overlay
        overlay.show()
        @el.addClass 'modal'

      # escapable
      @escapable() if !overlay || overlay.closable

      # position
      @el.removeClass 'hide'
      @el.appendTo 'body'
      @positionate()

      @emit 'showed'

    render: (options) ->
      {widget, content: child}  = options
      {sandbox, $el: el} = widget
      @el = el

      el.addClass 'hide' unless options.autoshow

      sandbox.inject options.content

      sandbox.once "#{child.name}.#{child.identifier || 'default'}.started", (widget) =>
        @positionate()

        el.find('.close').click (event) =>
          @emit 'close'
          @hide()
          event.preventDefault()

  type: 'Base'

  dialog: null

  options:

    autoshow: false
    modal: false
    closable: true
    size: null
    theme: null

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    # TODO integrate component and requirejs
    dialog  = require('dialog').Dialog
    overlay = require 'component-overlay'
    @sandbox.util.extend dialog.prototype, dialog_extensions

    widget_options = @extract_options()
    @dialog = new dialog
      widget: @, # TODO forward only element of the widget
      autoshow: @options.autoshow
      content: widget_options

      # TODO forward only element of the widget
      # sandbox: @sandbox
      # el: @$el


    @identifier = widget_options.name if @identifier == 'default'
    @$el.attr 'id', 'dialog'
    options.size && @$el.addClass options.size
    options.theme && @$el.addClass options.theme


    # TODO update dialog and remove this code when issue
    # https://github.com/component/dialog/issues/9 is fixed
    if @options.modal
      @dialog.on 'show', ->
        o = overlay closable: options.closable

        o.on 'hide', =>
          @_overlay = null
          @hide()

        @_overlay = o


    # TODO add deprecation warning messages to modal commands
    @sandbox.on "modal.#{@identifier}.show"     , @dialog.show  , @dialog
    @sandbox.on "modal.#{@identifier}.hide"     , @dialog.hide  , @dialog

    @sandbox.on "dialog.#{@identifier}.show"    , @dialog.show  , @dialog
    @sandbox.on "dialog.#{@identifier}.hide"    , @dialog.hide  , @dialog
    @sandbox.on "dialog.#{@identifier}.destroy" , @sandbox.stop , @sandbox
    @dialog.on 'hide', => @sandbox.emit "dialog.#{@identifier}.hidden"
    # @sandbox.on "modal.#{@identifier}.overlay", @dialog.overlay, @dialog

    # TODO build a custom presenter for the widget?
    # @presentation = presenter model
    # @bind presentation
    @sandbox.start()
    @options.autoshow && @sandbox.emit "dialog.#{@identifier}.show"

  stopped: ->
    @dialog.on 'hide', =>
      # TODO Remove when updating to aura 0.9
      @$el.remove()

    @dialog.hide()

  extract_options: ->
    options =  _.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl', 'theme'

    dynamic_options = _.omit options, Object.keys(@constructor.__super__.options)

    keys = Object.keys dynamic_options
    throw new TypeError "Too many keys on options object! #{keys.join(', ')}" unless keys.length == 1

    widget_options        = dynamic_options[keys[0]]
    widget_options.name ||= keys[0]
    widget_options.el     = @$el

    widget_options

