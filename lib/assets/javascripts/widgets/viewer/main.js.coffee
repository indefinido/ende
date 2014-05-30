'use strict';

lazy_require = 'advisable'
define [
  './states/index',
  './presenters/default',
  'jquery.inview',
  'stampit/stampit',
  'observable',
  lazy_require], (templates, presenter, inview, stampit, observable, advisable) ->

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

      # TODO set default abortion to decreatse page numbers amount
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


  # TODO Move each handler to independent features
  handleable = stampit
    handleables:
      item:
        hover: (event, models) ->
          if event.type == 'mouseenter'
            @hover models.item
          else if event.type == 'mouseleave'
            @hover null
          else
            throw new TypeError 'viewer.handlers.hover: Event type incompatible with hovering.'

        clicked: (event, models) -> @select models.item

  , {}, ->

    throw new TypeError "Widget property is mandatory for handleable stamp" unless @widget?

    @handlers =
      item:
        clicked: $.proxy @handleables.item.clicked, @widget
        hover  : $.proxy @handleables.item.hover  , @widget

    @
  version: '0.2.4'

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
    @sandbox.util.extend @presentation.selected   , item.model.json?() || item.model

    # TODO change paramters to item, item.model
    @sandbox.emit "viewer.#{@identifier}.selected", item.model

  # Called when hover in and out from model
  hover: (item) ->
    # TODO call presenter to do this job
    # @sandbox.util.extend @presentation.hovered   , item.model.json?() || item.model
    @sandbox.emit "viewer.#{@identifier}.hovered", item, item && item.model

  scope_to: (scope, child_scope) ->
    # Singuralize in order to accept association scopes, since
    # association scopes return almost the same kind as of it's
    # singularized version
    sent_scope    = @inflector.singularize scope.resource.toString()
    current_scope = @inflector.singularize @scope.resource.toString()

    deferred      = @sandbox.data.deferred()

    if sent_scope != current_scope
      throw new TypeError "Invalid scope sent to viewer@#{@identifier} sent: '#{sent_scope}', expected: '#{current_scope}'"

    # For sobsequent usages we must store the scope
    @scope = scope

    @sandbox.emit "viewer.#{@identifier}.scope_changed", @scope

    # TODO better scope data binding, and updating
    if @view? and scope.scope?.data
      @view.update
        scope_data: observable scope.scope.data

    @repopulate()

  # TODO rename this method
  # TODO also move this to an external tag
  statused: (status) ->
    if status
      @status = status
      @sandbox.emit "viewer.#{@identifier}.status_changed", status
    else
      @status

  repopulate: ->
    unless @fetching?
      if @load?
        @load.stop()
        @load = null
    else
      @fetching?.abort?()

    # TODO store spinner instance, instead of creating a new one every time
    unless @load?
      @load   = @sandbox.ui.loader @$results

      # TODO implement status for viewer widget
      @statused 'loading'
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
      # use it here instead of overriding all records
      viewer.items = records

    @fetching.done (records) =>
      if viewer.items.length
        # boo.initialize @$el.find '.results .items'
        @$el.addClass 'filled'
        @$el.removeClass 'empty'
      else
        # TODO implement state support for viewer widget
        @$el.addClass 'empty'
        @$el.removeClass 'filled'

      @sandbox.emit "viewer.#{@identifier}.populated", records, @

    @fetching.always =>
      if @load?
        @load.stop()
        @load = null

      # TODO implement status for viewer widget
      @$el.removeClass 'loading'
      @statused 'idle'
      @$el.addClass 'idle'

  populate: ->
    @load   = @sandbox.ui.loader @$el

    # TODO implement status for viewer widget
    @statused 'loading'
    @$el.removeClass 'idle'
    @$el.addClass 'loading'

    # TODO replace with strategy pattern, please!
    if @options.records?.length

      deferred = jQuery.Deferred()
      deferred.resolveWith @scope, [@options.records]

    else if @options.autofetch

      deferred = @scope.every()

    else

      deferred = jQuery.Deferred()
      deferred.resolveWith @scope, [[]]

    # Initialize dependencies
    # TODO replace with strategy pattern, please!
    deferred.done (records) =>

      @load.stop()

      # TODO do not send records as parameter
      @presentation = @presenter records, @scope, @handleable

      # Initialize elements
      @$el.html templates[@options.resource]
      @$results = @$el.find '.results .items'

      if records.length
        # boo.initialize @$el.find '.results .items'
        @$el.addClass 'filled'
      else
        @$el.addClass 'empty'

      # TODO move binders to application
      @inherit_parent_presentation()
      # TODO on bind execute presentation_options method and extend and inherit from presenter what needed
      @bind @presentation, @sandbox.util.extend(true, @presenter.presentation, @options.presentation)

      @presentation.viewer.subscribe 'items', =>
        # Start possible widgets created by items with widget
        # instantiation markup
        @syncronize_children()


      # Start widgets that may have been created by bindings
      @sandbox.emit 'aura.sandbox.start', @sandbox
      @syncronize_children()

      @handles 'click', 'back', '.back'

      @sandbox.emit "viewer.#{@identifier}.populated", records, @


    deferred.fail =>
      # TODO better error message and viewer status
      @html 'Failed to fetch data from server.'


  plugins: (options) ->
    deferreds = [@]

    deferreds.push paginable  widget: @ if options.page
    deferreds.push scrollable widget: @ if options.scroll
    deferreds.push scopable   @         if options.scope or options.scopable

    @sandbox.data.when deferreds...

  # TODO move this method to an extension
  syncronize_children: ->
    @sandbox._children ||= []
    @sandbox._widget   ||= @

    # Add possible new childs
    @constructor.startAll(@$el).done (widgets...) =>
      for widget in widgets
        widget.sandbox._widget = widget
        widget.sandbox._parent = @sandbox

      @sandbox._children = @sandbox._children.concat widgets

      for widget in widgets
        # TODO emit this event only when all siblings have initialized
        @sandbox.emit "#{widget.name}.#{widget.identifier}.siblings_initialized", @sandbox._children

      true

    # TODO better internal aura widget selection
    # Prevent other child to be instantiated
    @$el.find('[data-aura-widget]').each (i, element) ->
      current = element.getAttribute 'data-aura-widget'
      element.removeAttribute 'data-aura-widget'
      element.setAttribute 'aura-widget', current

  # TODO move this method to an extension
  inherit_parent_presentation: ->
    return unless view = @sandbox?._parent?._view
    advisable view unless view.after?

    # TODO move this method to sandbox
    isDescendant = (parent, child) ->
      node = child.parentNode

      while (node != null)
        return true if (node == parent)
        node = node.parentNode

      false

    inherited = []
    # Copy default models
    # TODO think if its a good idea to notify about model name conflicts
    for name, model of view.models when not @presentation[name] # By default do not override child models with parent models
      @presentation[name] = model
      inherited.push name

    # TODO store bindings instead of searching every time
    for binding in view.bindings when binding.iterated
      for subview in binding.iterated
        if isDescendant subview.els[0], @$el.get(0)
          for name, model of subview.models when not @presentation[name]
            advisable subview
            @presentation[name] = model
            inherited.push name

          break

    # Schedule update of copied models
    view.after 'update', (models) =>
      @update_inherited_models view, models, inherited

    subview.after 'update', (models) =>
      @update_inherited_models view, models, inherited

    true

  update_inherited_models: (parent, models, inherited) ->
    # Only update inherited models
    models = @sandbox.util._.pick models, inherited

    isDescendant = (parent, child) ->
      node = child.parentNode

      while (node != null)
        return true if (node == parent)
        node = node.parentNode

      false

    # Copy default models
    # TODO think if its a good idea to notify about model name conflicts
    for name, model of models
      @presentation[name] = model

    @view.update models

    # TODO store bindings instead of searching every time
    for binding in parent.bindings when binding.iterated
      for subview in binding.iterated
        if isDescendant subview.els[0], @$el.get(0)
          models = @sandbox.util._.pick subview.models, inherited
          @view.update models
          @presentation[name] = model for model in models
          break

    true

  initialize: (options) ->
    # TODO import core extensions in another place
    @resource      = @sandbox.resource options.resource
    @scope         = @resource

    # Instantiate it's on handleable factory
    widget         = @
    widgetable     = stampit().enclose -> @widget = widget; @
    @handleable    = stampit.compose widgetable, handleable

    {sandbox: {util: {@inflector}}}   = @

    @sandbox.on "viewer.#{@identifier}.scope", @scope_to, @

    # Initalize plugins
    # TODO think how to implement plugins api
    loading = @plugins options

    @statused 'idle'
    @$el.addClass "viewer widget #{@inflector.cssify @identifier} idle clearfix"

    loading.done (widget) ->
      widget.require_custom options.resource

  # TODO externalize this code to an extension
  require_custom: (resource) ->
    deferred = @sandbox.data.deferred()

    # Fetch custom templates
    # TODO better custom templates structure and custom presenter
    # TODO better segregation of concerns on this code
    # TODO handle case where custom presenter does not exist!
    require [
      "text!./widgets/viewer/templates/default/#{resource}.html"
      "./widgets/viewer/presenters/#{resource}"
      ], (custom_default_template, custom_presenter) =>

      unless presenter.hasOwnProperty 'handlers'
        Object.defineProperty presenter, 'handlers',
          get: -> throw new Error "presenter.hanlder is deprecated, please compose upon handleable"
          set: -> throw new Error "presenter.hanlder is deprecated, please compose upon handleable"

      custom_default_template and templates[resource] = custom_default_template
      @presenter  = @sandbox.util.extend custom_presenter, presenter if custom_presenter

      # Fetch default data
      @populate()

      deferred.resolveWith @, [resource]

    , (error) =>
      # TODO handle other status codes with xhr error
      @sandbox.logger.error "Error when loading presenter and template for resource '#{resource}':\n\n", error.message + "\n\n", error
      deferred.rejectWith @, arguments

    deferred
