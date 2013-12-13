# = require lunr/lunr

# TODO reconstruir usando https://github.com/javve/list.js
define ['./states/index', './presenter'], (templates, presenter) ->

  # TODO move lunar and lunr to an extension
  luna =
    index : null
    store : Map()
    fields: ['name', 'description']
    sandbox:
      search:
       index: lunr
    initialize: (records) ->
      throw 'no records provided' unless records?

      @sample = records[0]
      @index  = @sandbox.search.index(@indexate)

      for record in records
        @index.add record
        @store.set record._id, record

      @store.all = records

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


  # Widget Prototype

  type: 'Base'

  initialize: (options) ->
    widget  = @
    sandbox = @sandbox
    sandbox.logger.log "initialized!"

    record = sandbox.models[options.model]

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