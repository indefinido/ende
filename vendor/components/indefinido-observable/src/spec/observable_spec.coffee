observable = require('observable').mixin
root = exports ? window

describe 'observable #()',  ->
  return unless root.should

  object = null

  beforeEach ->
    object = property: 'value'

  it 'should not have observed property', ->
    object.should.not.have.property 'observed'

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
      spy.called.should.be.true

    it 'should let multiple function subscriptions to property', ->
      also_called = false

      object.subscribe 'other', -> called = true

      object.subscribe 'other', -> also_called = true

      object.other = 'mafagafo'
      called.should.be.true
      also_called.should.be.true

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

        object.friends[0].should.be.eq friend
        friend.should.have.property 'observed'

        friend.subscribe 'domo', spy
        friend.domo = 2
        spy.callCount.should.be.eq 1

      xit 'should override native methods'
      it 'should preserve array bindings when setting new array', ->
        spy = sinon.spy()
        object.friends = []
        object.subscribe 'friends', spy

        object.friends.push 1
        object.friends = []
        object.friends.push 2

        object.friends.length.should.be.eq 1
        spy.callCount.should.be.eq 3


    it 'should create a observed property', ->
      object.should.have.property 'observed'

  xdescribe '#publish', ->

    xit 'should let element publish to property', ->
