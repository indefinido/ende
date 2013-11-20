# TODO Add base settings to validation
# model = window.model

# TODO implement method
# model[resource].validators_on 'field' # Get all validators related to this field

validations = require '../validatable'
stampit     = require '../../../vendor/stampit'

presenceable = stampit
  validate_each: (record, attribute, value) ->
    if value == null or value == '' or value == undefined
      record.errors.add attribute, 'blank', @options


composed = stampit.compose(validations.validatable, presenceable)
composed.definition_key = 'validates_presence_of'

validations.manager.validators.presence = composed