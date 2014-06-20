'use strict'

define ->

  # TODO remove component.json modal, and use our custom modal
  dialog_extensions =
    close_template: '<a class="close">&times;</a>'

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
      {widget, content: child} = options
      {sandbox, $el: el}       = widget
      identifier               = child.identifier || child.resource || 'default'
      @initialization          = sandbox.data.deferred()

      @el = el

      el.addClass 'hide'         unless options.autoshow
      el.addClass 'injecting'

      sandbox.inject options.content

      if options.closable
        # TODO use urls on hrefs istead of binding events
        el.on 'click', '.close', (event) =>
          @emit 'close'
          @hide()
          false

      # Positionate modal after widget insertions, when widget starts
      # visible
      @positionate()             if options.autoshow

      # TODO get identifier through sandbox method instead of generating here

      sandbox.once "#{child.name}.#{identifier}.started", (widget) ->
        el.removeClass 'injecting'
        @positionate()

        # TODO better close html creation and handling
        el.prepend @close_template if options.closable
      , @

      sandbox.once "#{child.name}.#{identifier}.initialized", (widget) ->
        @initialization.resolveWith @
      , @

    remove: ->
      @initialization.done ->
        @emit 'hide'
        @el.detach()
        @


  type: 'Base'

  dialog: null

  version: '0.1.1'

  options:

    autoshow: false
    modal: false
    closable: true
    size: null
    theme: null

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    # TODO integrate component and requirejs in a more consize way
    with_component = 'dialog'
    dialog  = require(with_component).Dialog

    with_component = 'component-overlay'
    overlay = require with_component

    @sandbox.util.extend dialog.prototype, dialog_extensions

    # Initialize fundamental style
    @$el.attr 'id', 'dialog'
    options.size && @$el.addClass options.size
    options.theme && @$el.addClass options.theme


    widget_options = @extract_options()

    @dialog = new dialog
      widget: @, # TODO forward only element of the widget
      autoshow: options.autoshow
      closable: options.closable
      content: widget_options

      # TODO forward only element of the widget
      # sandbox: @sandbox
      # el: @$el

    # TODO better dialog implementation
    options.closable && @dialog.closable()

    if @identifier == 'default' or @identifier == @name
      @identifier  = widget_options.name
      # TODO implement postaljs and filter children widgets by event
      # emitter instead of widget resources
      @identifier += '!' + widget_options.resource if widget_options.resource?

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
    options =  _.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl', 'theme', 'resource'

    # TODO merge default options in prototype
    dynamic_options = _.omit options, Object.keys(@__proto__.options)

    keys = Object.keys dynamic_options
    throw new TypeError "Too many keys on options object! #{keys.join(', ')}" unless keys.length == 1

    widget_options        = dynamic_options[keys[0]]
    widget_options.name ||= keys[0]
    widget_options.el     = @$el

    widget_options

