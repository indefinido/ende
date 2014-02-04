'use strict';

define [
  './states/index',
  './presenters/default',
  './presenters/default',
  '/assets/jquery/inview',
  'stampit/stampit'], (templates, presenter, inview, stampit) ->

  observable   = require('indefinido-observable').mixin

  # TODO define componentjs required packages, as requirejs packages
  stampit    ||= require 'stampit/stampit'

  scopable = (widget) ->
    deferred = widget.sandbox.data.deferred()

    # TODO add widget plug-in as an extension for a widget
    require ['widgets/viewer/plugins/scopable'], (scopable) ->
      deferred.resolveWith scopable, [scopable widget]

    deferred

  paginable = stampit
    flip_to: (page) ->
      @widget.scope.page (page - 1)
      @flip()

    flip: ->
      {scope} = @widget
      {page_number, total_pages} = scope

      return unless total_pages?

      scope.page ++page_number

      if page_number <= total_pages
        @widget.scope_to scope
      else
        @widget.sandbox.emit "#{@widget.name}.#{@widget.identifier}.last_page"
  ,
    {}
  , ->

    {sandbox, scope}   = @widget
    {page_number}      = scope
    scope.total_pages ?= Infinity

    unless scope.page? page_number
      throw new TypeError "Pagination could not be initialized required method scope#page not found!"

    # TODO scope.subscribe 'page_number', total_pages

    sandbox.on "#{@widget.name}.#{@widget.identifier}.flip"         , @flip    , @
    sandbox.on "#{@widget.name}.#{@widget.identifier}.flip_to"      , @flip_to , @

    stampit.mixIn @, @widget.options.pagination

  scrollable = stampit
    bottoned: ->
      scrollBottom     = @scroll_container.scrollTop() + @scroll_container.height()
      scrollableBottom = @widget.$el.height() + @widget.$el.offset().top

      scrollBottom + @buffer  > scrollableBottom

    scrolled: ->
      @widget.sandbox.emit "#{@widget.name}.#{@widget.identifier}.flip" if @bottoned()
  ,
    buffer: 400
  , ->
    @scroll_container = $ window

    @scroll_container.scroll _.throttle (params...) =>
      @scrolled params...
    , 500

    # Trigger more items loading if page starts in bottom state
    # TODO Account for autofetchable viewer
    @widget.sandbox.on "viewer.#{@widget.identifier}.populated", @scrolled, @

    stampit.mixIn @, @widget.options.scroll

  boo =
    cache: {}
    initialize: (container) ->
      container.children('.item')
        .each(@identify)
        .on('inview', @viewed)

    identify: (index, element) ->
      element  = $ element
      identity = _.uniqueId()
      element.data 'boo', identity
      boo.cache[identity] = element

    shame: (element) ->
      element  = $ element
      identity = element.data 'boo'
      child    = element.children()

      # We must store the current element state, we do so by storing a
      # custom tailored object in our object cache
      ghost =
        child: child
        shamed: true

      boo.cache[identity] = ghost

      element.css
        width: element.width()
        height: element.height()
        visibility: 'hidden'

      # child.detach()

    pride: (element) ->
      element  = $ element
      identity = element.data 'boo'
      ghost    = boo.cache[identity]

      if ghost and ghost.shamed
        ghost.shamed = false
        # In order to remove staticaly set width and height we pass
        # empty strings to css jquery method
        element.css width: '', height: '', visibility: ''


    viewed: (event, in_view, horizontal, vertical) ->
      boo[if in_view then 'pride' else 'shame'] event.target

  version: '0.2.1'

  # TODO better separation of concerns
  # TODO Current remote page that is beign displayed
  options:
    resource: 'default'

    # TODO rename records to resources
    records: null

    # Automatically fetch records on initialization
    autofetch: false

    # If page attribute is set, viewer will assume that there is a
    # page method on the scope
    page: null

    scroll: null

  type: 'Base'

  presenter: presenter

  select: (item) ->
    @selected_item?.selected = false
    @selected_item           = item
    item.selected            = true

    # We extend presentation.selected just to assign all values of the item model
    # TODO call presenter to do this job
    @sandbox.util.extend @presentation.selected   , item.model
    @sandbox.emit "viewer.#{@identifier}.selected", item.model

  scope_to: (scope, child_scope) ->
    throw new TypeError "Invalid scope sent to viewer@#{@identifier} sent: #{scope.resource.toString()}, expected: #{@scope.resource.toString()}" if scope.resource.toString() != @scope.resource.toString()
    @scope = scope

    # TODO better hierachical event distribution
    for { _widget: widget } in @sandbox._children?
      widget.scope_to? child_scope

    @sandbox.emit "viewer.#{@identifier}.scope_changed", @scope

    if @view? and scope.scope?.data
      @view.update
        scope_data: observable scope.scope.data

    @repopulate()

  repopulate: ->
    unless @fetching?
      if @load?
        @load.stop()
        @load = null
    else
      @fetching?.abort?()

    # TODO store spinner instance, instead of creating a new one every time
    unless @load?
      @load   = @sandbox.ui.loader @$el.find '.results .items'

      # TODO implement status for viewer widget
      @$el.addClass 'idle'
      @$el.removeClass 'loading'

    {viewer}        = @presentation

    # ✔ Generalize this filtering option
    # TODO make scope.all method use scope too, and replace @scope.fetch by it
    options  = @options # TODO better options accessing
    @fetching = @scope.fetch null, (records) =>

      # TODO instantiate records before calling this callback
      records = _.map records, @resource, @resource unless records[0]?.resource or records[0]?.itemable

      # TODO implement Array.concat ou Array.merge in observer, and
      # use it here instead of pushing each record
      viewer.items = records

      # Start widgets created by bindings
      @syncronize_children()

    @fetching.done (records) =>
      if viewer.items.length
        # boo.initialize @$el.find '.results .items'
        @$el.addClass 'filled'
        @$el.removeClass 'empty'
      else
        # TODO implement state support for viewer widget
        @$el.addClass 'empty'
        @$el.removeClass 'filled'

      @sandbox.emit "viewer.#{@identifier}.populated", records

    @fetching.always =>
      # TODO implement status for viewer widget
      @$el.addClass 'idle'
      @$el.removeClass 'loading'

      if @load?
        @load.stop()
        @load = null


  populate: (handlers) ->
    sandbox = @sandbox

    @load   = @sandbox.ui.loader @$results

    # TODO implement status for viewer widget
    @$el.removeClass 'idle'
    @$el.addClass 'loading'

    # TODO replace with strategy pattern, please!
    if @options.records?.length

      deferred = jQuery.Deferred()
      deferred.resolveWith @scope, [@options.records]

    else if @options.autofetch

      deferred = @scope.all()

    else

      deferred = jQuery.Deferred()
      deferred.resolveWith @scope, [[]]

    # Initialize dependencies
    # TODO replace with strategy pattern, please!
    deferred.done (records) =>

      @load.stop()

      @presentation = @presenter records, @scope

      @$el.html templates[@options.resource]

      if records.length
        # boo.initialize @$el.find '.results .items'
        @$el.addClass 'filled'
      else
        @$el.addClass 'empty'

      # TODO move binders to application
      @inherit_parent_presentation()
      @bind @presentation, @presenter.presentation

      # Start widgets that may have been created by bindings
      @sandbox.emit 'aura.sandbox.start', @sandbox
      @syncronize_children()

      @handles 'click', 'back', '.back'

      @sandbox.emit "viewer.#{@identifier}.populated", records


    deferred.fail =>
      # TODO better error message and viewer status
      @html 'Failed to fetch data from server.'


  plugins: (options) ->
    deferreds = []

    deferreds.push paginable  widget: @ if options.page
    deferreds.push scrollable widget: @ if options.scroll
    deferreds.push scopable   @         if options.scope or options.scopable

    @sandbox.data.when deferreds...

  # TODO move this method to an extension
  syncronize_children: ->
    @sandbox._children ||= []

    # Add possible new childs
    @constructor.startAll(@$el).done (widgets...) =>
      for widget in widgets
        widget.sandbox._widget = widget
        widget.sandbox._parent = @sandbox

      @sandbox._children = @sandbox._children.concat widgets

    # TODO better internal aura widget selection
    # Prevent other child to be instantiated
    @$el.find('[data-aura-widget]').each (i, element) ->
      current = element.getAttribute 'data-aura-widget'
      element.removeAttribute 'data-aura-widget'
      element.setAttribute 'aura-widget', current

  # TODO move this method to an extension
  # TODO listen for future parent presentation changes
  inherit_parent_presentation: ->
    return unless view = @sandbox?._parent?._view

    isDescendant = (parent, child) ->
      node = child.parentNode

      while (node != null)
        return true if (node == parent)
        node = node.parentNode

      false

    models = {}
    # Copy default models
    # TODO think if its a good idea to notify about model name conflicts
    for name, model of view.models
      @presentation[name] ||= model # By default do not child models with parent models

    for binding in view.bindings
      # Copy each binding models
      if binding.iterated
        for view in binding.iterated
          if isDescendant view.els[0], @$el.get(0)
            for name, model of view.models
              @presentation[name] ||= model

            break

    true


  initialize: (options) ->
    # TODO import core extensions in another place
    @resource      = @sandbox.resource options.resource
    @scope         = model = @resource
    cssify         = @sandbox.util.inflector.cssify

    @sandbox.on "viewer.#{@identifier}.scope", @scope_to, @

    # Iniitalize plugins
    loading = @plugins options

    @$el.addClass "viewer widget #{cssify @identifier} idle clearfix"

    loading.done =>
      @require_custom options

  require_custom: (options) ->
    # Fetch custom templates
    # TODO better custom templates structure and custom presenter
    # TODO better segregation of concerns on this code
    require [
      "text!./widgets/viewer/templates/default/#{options.resource}.html"
      "./widgets/viewer/presenters/#{options.resource}"
      ], (custom_default_template, custom_presenter) =>

      # TODO Better way to preserve widgets handlers
      handlers     =
        item:
          clicked: (event, models) =>
            @select models.item

      presenter.handlers = handlers

      custom_default_template and templates[options.resource] = custom_default_template
      @presenter = @sandbox.util.extend custom_presenter, presenter if custom_presenter

      @$results = @$el.find '.results .items'

      # Fetch default data
      @populate handlers

    true