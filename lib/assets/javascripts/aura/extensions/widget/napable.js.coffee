define 'aura/extensions/widget/napable', ->

  'use strict'

  napable =
    bind: ->
      @sandbox.on "#{@name}.#{@identifier}.sleep", napable.sleep, @
      @sandbox.on "#{@name}.#{@identifier}.wake" , napable.wake , @
    sleep: ->
      @$el.addClass 'asleep'
      @$el.removeClass 'awake'
    wake: ->
      @$el.addClass 'awake'
      @$el.removeClass 'asleep'

  napable_extensions =
    constructor: ->
      napable_extensions["super"].constructor.apply @, arguments
      napable.bind.call @

  # The purpose of this extension is allow parent widget to save
  # memory by sending a sleep command to the child widgets
  (application) ->

    version: '0.1.0'

    initialize: (application) ->
      {core} = application

      # Add support for element removal after stoping widget
      # TODO replace Base.extend inheritance to stampit composition
      core.Widgets.Base = core.Widgets.Base.extend napable_extensions
      napable_extensions.super  = core.Widgets.Base.__super__
