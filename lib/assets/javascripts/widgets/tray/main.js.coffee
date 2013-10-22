define ->

  'use strict'

  type: 'Base'

  initialize: (options) ->
    # TODO access omit method throuhgh underscore
    widget_options =  _.omit options, 'el', 'ref', '_ref', 'name', 'require', 'baseUrl'

    # TODO remove jquery dependency
    for name, suboptions of widget_options when $.type(suboptions) is "object"
      @add suboptions.name || name, suboptions

    @$el.addClass 'tray widget'

    # TODO find a way to build the id based on content
    @$el.attr 'id', options.identifier if options.identifier?

  add: (name, options) ->

    # TODO add widgets as childrens of the tray widget sandbox
    element     = jQuery '<div class="widget"></div>'
    options.el  = element
    @$el.append   element
    @inject name, options