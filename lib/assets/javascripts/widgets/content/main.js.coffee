define ->

  defaults =
    beforeSend: (xhr) ->
      xhr.setRequestHeader 'X-XHR-Referer', document.location.href

  type: 'Base'
  version: '0.1.0'
  options:
    autoload: true

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    @sandbox.on "content.#{@identifier}.load", @load, @

    if options.autoload
      delete options.autoload
      @sandbox.emit "content.#{@identifier}.load"

    @$el.addClass "content idle"
    @$el.attr 'id', @identifier unless @$el.attr 'id'

  normalize_options: (extra) ->
    throw new TypeError "content.initialize: Multiple before sends are not supported yet" if extra?.beforeSend

    options = @sandbox.util._.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'
    normalized_options = @sandbox.util.extend context: @, defaults, options, extra

    throw new TypeError "content.initialize: No uri provided to load content" unless normalized_options.uri?

    normalized_options.url = normalized_options.uri
    delete normalized_options.uri

    normalized_options

  # Total number of completed loads (loaded or failed)
  loads: 0

  load: (options) ->
    # TODO move to anoter method
    if @loads > 0
      @html ''

      @loading?.abort()
      @spinner?.stop()

    # Give user some feedback
    # TODO move spinner outside this component? And use only css
    # classes instead
    @spinner = @sandbox.ui.loader @$el
    @$el.addClass "loading"
    @$el.removeClass "idle"

    # TODO remove jQuery dependency
    @loading = $.ajax(@normalize_options options).done(@loaded).fail(@failed).always(@ended)

    @sandbox.emit "content.#{@identifier}.loading", @loading

  # Executed upon successfully loaded
  loaded: (response) ->
    # Will also initialize sandbox!
    @html response

  failed: (xhr) ->
    switch xhr.status
      when 401
        @sandbox.emit "content.#{@identifier}.loading_unauthorized"
      else
        # TODO better debugging code location
        if @sandbox.debug.enabled
          html  = "<h2>Content Widget: Failed to load Content</h2>"
          html += xhr.responseText
          html  = html.replace /\n/g, '<br/>'

        else
          # TODO prettier default user message message
          html  = "Failed to load content."

        @html html

  ended: ->
    @$el.removeClass "loading"
    @$el.addClass "idle"
    @loads++

    # TODO move to anoter method
    @spinner?.stop()
    @spinner = null
    @loading = null

