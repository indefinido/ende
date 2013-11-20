define 'value_objects/phone', ->

  # TODO locales support
  class @Phone

    constructor: (@area_code, @number) ->
      {@area_code, @number} = @area_code if typeof @area_code == 'object'


      # TODO parse argument types to validate value object domain
      # constraints

      unless @number
        @number    = @area_code
        @area_code = null

      # TODO add as requirement observable shim!
      Object.defineProperty @, 'valid', get: @validate

    # TODO move type validation to indemma files
    validate: -> @area_code && @number

    toString: ->
      striped_number = @number.replace /\-/g, ''

      if striped_number
        if striped_number.length > 4
          formatted_number = striped_number.substr(0, 4) + '-' + striped_number.substr(4)
        else
          formatted_number = striped_number

      if @area_code?
        "(#{@area_code}) #{formatted_number}"
      else
        formatted_number or ''

    toJSON: ->
      area_code: @area_code
      number: @number