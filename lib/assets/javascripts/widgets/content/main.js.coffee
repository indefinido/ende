define ->

  type: 'Base'
  version: '0.1.1'
  options:
    autoload: true

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    @sandbox.on "content.#{@identifier}.load", @load, @

    # TODO convert options to respective types and remove != 'false' comparison
    if options.autoload and options.autoload != 'false'
      delete options.autoload
      @sandbox.emit "content.#{@identifier}.load"

    @$el.addClass "content idle"
    @$el.attr 'id', @identifier unless @$el.attr 'id'

  request_options: (extra) ->
    options = @sandbox.util._.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'

    normalized_options = @sandbox.util.extend context: @, options, extra

    throw new TypeError "content.initialize: No uri provided to load content" unless normalized_options.uri?

    normalized_options.url = normalized_options.uri
    delete normalized_options.uri

    normalized_options.headers = @sandbox.util.extend 'X-XHR-Referer': document.location.href, normalized_options.headers

    normalized_options


  # Total number of completed loads (loaded or failed)
  loads: 0

  # TODO move to handlers
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
    @loading = $.ajax(@request_options options).done(@loaded).fail(@failed).always(@ended)

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
          html  = "<h2>Content Widget: Failed to load Content. Click to retry.</h2>"
          html += xhr.responseText
          html  = html.replace /\n/g, '<br/>'

        else
          # TODO prettier default user message message
          html  = "Failed to load content. Click to retry."

        # TODO change method name to retry
        # TODO treat complex settings cases, and better store the settings
        @$el.one('click', => @load())

        @html html

  ended: ->
    @$el.removeClass "loading"
    @$el.addClass "idle"
    @loads++

    # TODO move to anoter method
    @spinner?.stop()
    @spinner = null
    @loading = null

