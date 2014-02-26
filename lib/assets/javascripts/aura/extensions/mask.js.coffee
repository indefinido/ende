'use strict'

define 'aura/extensions/mask',

  version: '0.1.1'

  require:
    paths:
      jquery: true
      mask: 'jquery/inputmask'
      mask_extensions: 'jquery/inputmask.extensions'
      mask_numeric_extensions: 'jquery/inputmask.numeric.extensions'
    shim:
      # TODO implement exports option to check for properties
      mask_extensions: ['mask']
      mask_numeric_extensions: ['mask', 'mask_extensions']

  initialize: (application) ->
    {core, sandbox} = application

    $ = require 'jquery'

    with_aura = 'mask'
    require with_aura

    with_aura = 'mask_extensions'
    require with_aura

    with_aura = 'mask_numeric_extensions'
    require with_aura

    mask = (selector, mask, options) -> $(selector).inputmask mask, options

    sandbox.ui = sandbox.util.extend sandbox.ui, mask: mask

  extend: ->

    # TODO conditionally extend and require this masks

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


