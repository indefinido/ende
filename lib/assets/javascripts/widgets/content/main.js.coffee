define ->

  defaults =
    context: null
    beforeSend: (xhr) ->
      xhr.setRequestHeader 'X-XHR-Referer', document.location.href

  type: 'Base'
  version: '0.0.1'
  options:
    autoload: true

  initialize: (options) ->
    @sandbox.logger.log "initialized!"

    throw new TypeError "content.initialize: No uri provided to load content" unless options.uri?
    throw new TypeError "content.initialize: Multiple before sends are not supported yet" if options.beforeSend

    defaults.context = @

    options.url = options.uri
    delete options.uri

    if options.autoload
      delete options.autoload
      @load()
    else
      @sandbox.once "content.#{@identifier}.load", @, @load

  load: ->
    options = @sandbox.util._.omit @options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'
    options = $.extend {}, defaults, options

    # TODO remove jQuery dependency
    $.ajax(options).done(@loaded).fail(@failed)

  loaded: (response) ->

    # Will also initialize sandbox!
    @html response

  failed: ->

    @html 'Failed to load content'
