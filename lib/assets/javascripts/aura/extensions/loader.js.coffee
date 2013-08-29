define 'aura/extensions/loader', ->

  'use strict';

  try
    Spinner = require 'seminovos/vendor/assets/javascripts/spin/spin'
  catch e
    Spinner = require 'modacad/vendor/assets/javascripts/spin/spin'


  (application) ->
    core     = application.core
    mediator = core.mediator

    loader =

      options:
        lines: 5             # The number of lines to draw
        length: 0            # The length of each line
        width: 12            # The line thickness
        radius: 0            # The radius of the inner circle
        corners: 0           # Corner roundness (0..1)
        rotate: 90           # The rotation offset
        direction: 1         # 1: clockwise -1: counterclockwise
        color: '#FFF'        # #rgb or #rrggbb
        speed: 1.6           # Rounds per second
        trail: 75            # Afterglow percentage
        shadow: false        # Whether to render a shadow
        hwaccel: false       # Whether to use hardware acceleration
        className: 'loader'  # The CSS class to assign to the spinner
        zIndex: 2e9          # The z-index (defaults to 2000000000)
        top: 'auto'          # Top position relative to parent in px
        left: 'auto'         # Left position relative to parent in px

      # Returns a new spinner (http://fgnass.github.io/spin.js)
      # Hiding the spinner
      #  To hide the spinner, invoke the stop() method, which removes the UI elements from the DOM
      #  and stops the animation. Stopped spinners may be reused by calling spin() again.
      create: (selector, options) ->
        target = core.dom.find selector
        new Spinner(core.util.extend {}, @options, options).spin target[0]

    name: 'loader'
    initialize: (application) ->
      core.ui ||= {}
      application.sandbox.ui = core.ui
      core.ui.loader = ->
        loader.create arguments...