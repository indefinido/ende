define 'aura/extensions/widget/napable', ->

  'use strict'

  # TODO think about adding rivets bindings to the element
  napable = stampit
    bind: ->
      @sandbox.on "#{@name}.#{@identifier}.sleep", napable.sleep, @
      @sandbox.on "#{@name}.#{@identifier}.wake" , napable.wake , @
    sleep: ->
      @$el.addClass 'asleep'
      @$el.removeClass 'awake'
    wake: ->
      @$el.addClass 'awake'
      @$el.removeClass 'asleep'
  ,
    naping: false
  , ->
    napable_extensions["super"].constructor.apply @, arguments
    napable.bind.call @

  # The purpose of this extension is allow parent widget to save
  # memory by sending a sleep command to the child widgets
  (application) ->

    version: '0.1.1'

    initialize: (application) ->
      {core} = application
      core.Widgets.Base.compose napable
