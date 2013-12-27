define ->

  'use strict'

  type: 'Base'

  version: '0.1.2'

  initialize: (options) ->
    names = []
    {identifier} = options

    # TODO access omit method throuhgh underscore
    widget_options =  _.omit options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl', 'resource'

    # TODO remove jquery dependency
    for name, suboptions of widget_options when $.type(suboptions) is "object"
      names.push suboptions.name || name
      @add suboptions.name || name, suboptions

    @$el.addClass ['tray', 'widget'].concat(names).join(' ')

    @identifier = options.identifier
    # TODO find a way to build the id beased on content
    if identifier?
      @identifier = identifier
      @$el.attr 'id', identifier

    @sandbox.start()

  add: (name, options) ->

    # TODO add widgets as childrens of the tray widget sandbox
    element     = jQuery '<div class="widget"></div>'
    options.el  = element
    @$el.append   element
    @inject name, options