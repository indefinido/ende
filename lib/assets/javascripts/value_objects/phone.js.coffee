define 'value_objects/phone', ->

  # TODO locales support
  class @Phone

    # TODO Externalize phone matchers?
    PHONE_MATCHERS:
      # TODO add area codes for RJ and ES when today is greater than 20/07/2014 (or earlieer)
      'pt-BR': /^(0?\d{2})(\d{0,9})/

    constructor: (@area_code, @number) ->

      # TODO better parse argument types to validate value object domain
      # constraints
      if typeof @area_code == 'object'
        {@area_code, @number} = @area_code
      else if typeof @area_code == 'string' and not @number
        serialized = @area_code.replace /[(+\-)\s]/g, ''
        matches    = @PHONE_MATCHERS['pt-BR'].exec serialized

        if matches
          @area_code = matches[1]
          @number    = matches[2]

      unless @number
        @number    = @area_code
        @area_code = null

      # TODO add as requirement observable shim!
      Object.defineProperty @, 'valid', get: @validate

    # TODO move type validation to indemma files
    validate: -> @area_code && @number

    toString: ->
      # TODO only store integer number, and remove this strip from here
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
      null unless @area_code and @number
      
      area_code: @area_code
      number: @number
