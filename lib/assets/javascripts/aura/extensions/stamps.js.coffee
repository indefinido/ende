'use strict'

define 'aura/extensions/stamps', ->


  name: 'stamps'

  version: '0.1.0'

  require:
    paths:
      stampit: 'aura/extensions/stamps/stampit'

  initialize: (application) ->
    {sandbox, core} = application
    stampit = require 'stampit'

    core.stamps = {}

    # TODO store stamps on a sandbox basis too
    sandbox.stamp = core.stamp = stampit.mixIn (name, params...) ->
      unless typeof name == 'string'
        params.unshift name
        name = null

      stamp = stampit.apply stampit, params

      if name then core.stamps[name] = stamp else stamp

    , stampit





