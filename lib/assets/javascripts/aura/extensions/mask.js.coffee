#= require 'jquery/inputmask'
#= require 'jquery/inputmask.extensions'
#= require 'jquery/inputmask.numeric.extensions'

$.extend $.inputmask.defaults.aliases.integer,
    groupSeparator : '.'
    autoGroup      : true
    autoUnmask     : true

$.extend $.inputmask.defaults.aliases.decimal,
    groupSeparator : '.'
    radixPoint     : ','
    autoGroup      : true
    autoUnmask     : true


$.extend $.inputmask.defaults.aliases,
    price:
      alias          : 'decimal'
      digits         : 2
      allowMinus     : false
      allowPlus      : false

    plate:
      mask           : 'AAA-9999'

    meters:
      alias          : 'integer'
      allowMinus     : false
      allowPlus      : false
      integerDigits  : 6

    cpf:
      mask           : '999.999.999-99'

    cnpj:
      mask           : '99.999.999/9999-99'

    phone:
      mask           : '(99) 9999[9]-9999'



define 'aura/extensions/mask', (mask) ->

  'use strict'


  (application) ->


    mask = (selector, mask, options) ->
      $(selector).inputmask mask, options


    version: '0.1.0'

    initialize: (application) ->
      {core, sandbox} = application

      sandbox.ui = sandbox.util.extend sandbox.ui, mask: mask
