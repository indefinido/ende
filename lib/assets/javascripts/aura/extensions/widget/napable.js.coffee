'use strict'

define 'aura/extensions/widget/napable', ['stampit/stampit'], (stampit) ->

  # TODO think about adding rivets bindings to the element
  napable = stampit
    tired: ->
      @sandbox.on "#{@name}.#{@identifier}.sleep", @sleep, @
      @sandbox.on "#{@name}.#{@identifier}.wake" , @wake , @
      @
    sleep: ->
      @$el.addClass 'asleep'
      @$el.removeClass 'awake'
    wake: ->
      @$el.addClass 'awake'
      @$el.removeClass 'asleep'
  ,
    naping: false
  , -> @tired()

  # The purpose of this extension is allow parent widget to save
  # memory by sending a sleep command to the child widgets
  (application) ->

    version: '0.1.2'

    initialize: (application) ->
      {core} = application
      core.Widgets.Base.compose napable
