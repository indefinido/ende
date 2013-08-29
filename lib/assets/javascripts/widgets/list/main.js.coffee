# = require lunr/lunr

define ['./states/index', './presenter'], (templates, presenter) ->

  # TODO move lunar and lunr to an extension
  luna =
    index : null
    store : Map()
    fields: ['name', 'description']
    sandbox:
      search:
       index: lunr
    initialize: (models) ->
      throw 'no models provided' unless models?

      @sample = models[0]
      @index  = @sandbox.search.index(@indexate)

      for model in models
        @index.add model
        @store.set model._id, model

      @store.all = models

    # TODO put bold face on matched texts
    search: (params...) ->
      findings = @index.search params...

      results = []
      results.push @store.get finding.ref for finding in findings

      @index.eventEmitter.emit 'searched', results
      results

    indexate: () ->
      sample = luna.sample
      fields = luna.fields

      sample[name] and @field name for name in fields
      @ref '_id'
      true


  # If some extension provides you can use the type defineda in there
  # to extend your widget. Defaults to Base constructor.
  #
  # type: 'Base'

  # Default values for the options passed to this widget
  #
  # Note: the options are passed thorught the html element data
  # attributes for this widget: <div data-aura-amount="3"></div>
  #
  # options: {}


  # Widget initialization method, will be called upon loading, options
  # are already filled with defaults
  initialize: (options) ->
    widget  = @
    sandbox = @sandbox
    sandbox.logger.log "initialized!"

    model = sandbox.models[options.model]

    # Will also initialize sandbox!
    @html templates.default
    @$el.addClass 'list widget'

    # Forward the models to the presenter

    model.all (records) ->

      # Bind presenter to template
      presentation = presenter records, luna

      luna.initialize presentation.list.items
      luna.index.on 'searched', (results) ->
        sandbox.emit 'list.searched', results


      sandbox.view.bind widget.$el.children(), presentation