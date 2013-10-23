define ->

  'use strict'

  type: 'Base'

  version: '0.1.0'

  initialize: (options) ->
    names = []

    # TODO access omit method throuhgh underscore
    widget_options =  _.omit options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'

    # TODO remove jquery dependency
    for name, suboptions of widget_options when $.type(suboptions) is "object"
      names.push suboptions.name || name
      @add suboptions.name || name, suboptions

    @$el.addClass ['tray', 'widget'].concat(names).join(' ')

    # TODO find a way to build the id based on content
    @$el.attr 'id', options.identifier if options.identifier?

  add: (name, options) ->

    # TODO add widgets as childrens of the tray widget sandbox
    element     = jQuery '<div class="widget"></div>'
    options.el  = element
    @$el.append   element
    @inject name, options