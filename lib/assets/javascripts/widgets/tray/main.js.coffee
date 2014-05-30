'use strict'

define

  type: 'Base'

  version: '0.1.2'

  initialize: (options) ->
    {identifier} = options
    @names = []

    # TODO access omit method throuhgh sandbox
    widget_options =  _.omit options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl', 'resource'

    # TODO remove jquery dependency
    injections = @prepare_injections widget_options

    @$el.addClass ['tray', 'widget'].concat(@names).join(' ')

    @identifier ||= identifier

    # TODO find a way to build the id based on content
    if identifier?
      @identifier = identifier
      @$el.attr 'id', identifier

    # TODO get defer through sandbox
    _.defer =>
      @sandbox.start injections

  prepare_injections: (widget_options) ->
    # TODO remove jquery dependency, and use type detection through sandbox
    for name, suboptions of widget_options when $.type(suboptions) is "object"
      @names.push suboptions.name || name

      # TODO do not allow elements outside of the tray
      # TODO remove jquery dependency, and use documentFragment to build widgets
      # TODO allow widgets without elements
      @$el.append suboptions.el = jQuery '<div class="widget"></div>'

      @injection
        name: suboptions.name || name
        options: suboptions

