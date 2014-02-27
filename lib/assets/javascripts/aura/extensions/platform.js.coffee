'use strict';

define 'aura/extensions/platform', ->

  name: 'platform'
  version: '0.1.0'
  initialize: (application) ->
    descriptors = platform: get: -> true

    # Force core to be a dom element, so we can use getters and setters
    application.core    = Object.create application.core, descriptors
    application.sandbox = Object.create application.sandbox, descriptors

  # TODO copy other properties to the main application