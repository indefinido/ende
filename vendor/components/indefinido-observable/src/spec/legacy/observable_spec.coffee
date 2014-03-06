observable = require('observable').mixin
root = exports ? window
$ = require 'jquery'

describe 'observable #()',  ->

  object = null

  beforeEach ->
    object = property: 'value'

  it 'should not have observed property', ->
    expect(object.observed).toBeUndefined()

  xit 'should let element unsubscribe to property', ->

  describe '#subscribe', ->
    called = null

    beforeEach ->
      object = observable({})
      called = false
      true

    it 'should subscribe to property', ->
      spy = sinon.spy()
      object.subscribe 'other', spy
      object.other = 'mafagafo'

      expect(spy.called).toBe true


    it 'should let multiple function subscriptions to property', ->
      also_called = false
      also_also_called = false

      object.subscribe 'other', -> called = true

      object.subscribe 'other', -> also_called = true

      object.subscribe 'other', -> also_also_called = true

      object.other = 'mafagafo'

      expect(called).toBe true
      expect(also_called).toBe true

    it 'should handle truth comparisons well', ->
      spy = sinon.spy
      block_called  = false
      object.invert = true
      object.truthy = true
      object.falsey  = false

      object.subscribe 'truthy', spy
      object.subscribe 'falsey' , spy
      object.subscribe 'invert', spy

      block_called = false
      if object.truthy
        # dump 'truthy'
        block_called = true

      expect(block_called).toBe true

      block_called = false
      # dump (object.falsey + '') == 'false'
      unless object.falsey
        # dump 'falsey'
        block_called = true

      expect(block_called).toBe true

      block_called = false
      if object.invert
        # dump 'invert'
        block_called = true

      object.invert = false

      block_called = false
      if object.invert == false
        # dump 'inverted'
        block_called = true

      expect(block_called).toBe true


    describe 'subscribes to properties of type array', ->
      it 'should observe objects added to array', ->
        spy = sinon.spy()
        friend = {domo: 1}

        # TODO implement a one time setter to solve this
        # Specifically on array types
        # property must be an array before subscribing
        object.friends = []

        # Remember, you must subscribe to new properties to
        # turn then into observable ones
        object.subscribe 'friends', ->

        object.friends = [friend]
        friend = object.friends[0]

        expect(friend.domo    ).toBeDefined()
        expect(friend.observed).toBeDefined()

        friend.subscribe 'domo', spy
        friend.domo = 2
        expect(spy.callCount).toBe 1

      it 'should override native methods'

      it 'should preserve array bindings when setting new array', ->
        spy = sinon.spy()
        object.friends = []
        object.subscribe 'friends', spy

        object.friends.push 1
        object.friends = []
        object.friends.push 2

        expect(object.friends.length).toBe 1
        expect(spy.callCount).toBe 3

    it 'should create a observed property', ->
#      object.should.have.property 'observed'

  xdescribe '#publish', ->

    xit 'should let element publish to property', ->
