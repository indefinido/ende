require 'observable/vendor/shims/accessors.js'

$ = require 'jquery'

describe 'Object #defineProperty',  ->

  describe 'on dom elements', ->
    spy = object = null

    beforeEach ->
      object = document.createElement 'domo'
      document.body.appendChild object
      spy = sinon.spy()


    it 'should define property', (done) ->
      Object.defineProperty object, 'kun', {}

    it 'should define property getter', (done) ->
      getter = sinon.stub().returns(42)

      Object.defineProperty object, 'kun',
        get: getter

      expect(object.kun + 1).toBe 43
      expect(getter.called).toBe true

    it 'should define property setter', (done) ->

      Object.defineProperty object, 'kun',
        set: spy

      object.kun = 10

      expect(spy.calledWith 10).toBe true

  describe 'off dom elements', ->

    beforeEach ->
      @object = {}
      @spy = sinon.spy()

    # it's simply not possible
    it 'should not define property setter', (done) ->
      expect( =>
        Object.defineProperty @object, 'kun',
          set: @spy
      ).toThrow()


    it 'should define property getter', (done) ->
      getter = sinon.stub().returns(42)

      Object.defineProperty @object, 'kun',
        get: getter

      expect(@object.kun + 1).toBe 43
      expect(getter.called).toBe true

