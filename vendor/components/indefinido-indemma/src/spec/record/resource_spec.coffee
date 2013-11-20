require 'indemma/lib/record/restfulable'
require 'indemma/lib/record/resource'

root = exports ? window

model  = root.model  # TODO model = require 'indemma/model'
record = root.record # TODO model = require 'indemma/record'
jQuery = require 'component-jquery'

describe 'resource', ->

  describe 'with scope option', ->
    person = towel = null

    beforeEach ->
      person   = model.call
        resource: 'person'

      towel    = model.call
        resource:
          name: 'towel'
          scope: 'users'


    it 'should be prefixed with scope', ->
      towel.       route.should.be.eq '/users/towels'
      towel( { } ).route.should.be.eq '/users/towels'
      towel(id: 1).route.should.be.eq '/users/towels'


  describe 'with singular resource', ->
    towel = null

    beforeEach ->
      towel   = model.call
        resource:
          name: 'towel'
          singular: true

      deferred = jQuery.Deferred()
      deferred.resolveWith towel(name: 'Arthur'), [_id: 1]
      sinon.stub(jQuery, "ajax").returns(deferred)
      promises = towel.create {name: 'Arthur'}, {name: 'Ford'}

    afterEach  -> jQuery.ajax.restore()

    it 'the route should be in singular form', ->
      towel.       route.should.be.eq '/towel'
      towel( { } ).route.should.be.eq '/towel'
      towel(id: 1).route.should.be.eq '/towel'


  describe 'when included', ->
    xit 'sets the resource loaded flag on model', ->
      # model.resource.should.be.true

  describe 'model' ,  ->
    it 'add methods to model object'

    describe '#pluralize', ->
      xit 'transforms word into plural form'

    describe '#singularize', ->
      xit 'transforms word into singular form'