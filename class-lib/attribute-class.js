/**
 * tequila
 * attribute-class
 */
// Attribute Constructor
function Attribute(args, arg2) {
  var splitTypes; // For String(30) type
  if (false === (this instanceof Attribute)) throw new Error('new operator required');
  if (typeof args == 'string') {
    var quickName = args;
    args = [];
    args.name = quickName;
    if (typeof arg2 == 'string') {
      args.type = arg2;
    }
  }
  args = args || [];
  this.name = args.name || null;
  this.label = args.label || args.name;
  this.type = args.type || 'String';
  splitTypes = splitParens(this.type);
  this.type = splitTypes[0];
  var unusedProperties = [];
  switch (this.type) {
    case 'ID':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'String':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value', 'size']);
      this.size = splitTypes[1] ? splitTypes[1] : typeof args.size == 'number' ? args.size : args.size || 50;
      this.value = args.value || null;
      break;
    case 'Date':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Boolean':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Number':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Model':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value', 'modelType']);
      this.value = args.value || null;
      this.modelType = args.modelType || null;
      break;
    case 'Group':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value']);
      this.value = args.value || null;
      break;
    case 'Table':
      unusedProperties = T.getUnusedProperties(args, ['name', 'type', 'label', 'value', 'group']);
      this.value = args.value || null;
      this.group = args.group || null;
      break;

    default:
      break;
  }
  var badJooJoo = this.getValidationErrors(); // before leaving make sure valid Attribute
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Attribute: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Attribute: ' + badJooJoo[0]);
}
/*
 * Methods
 */
Attribute.prototype.toString = function () {
  return this.name === null ? 'new Attribute' : 'Attribute: ' + this.name;
};
Attribute.prototype.getValidationErrors = function () {
  var errors = [];
  if (!this.name) errors.push('name required');
  var shit = T.getAttributeTypes();
  if (!T.contains(shit, this.type))
    errors.push('Invalid type: ' + this.type);
  switch (this.type) {
    case 'ID': // Todo how to handle IDs ?
      if (!(this.value == null /*  || this.value instanceof ID */ )) errors.push('value must be null or a ID');
      break;
    case 'String':
      if (typeof this.size != 'number') errors.push('size must be a number from 1 to 255');
      if (this.size < 1 || this.size > 255) errors.push('size must be a number from 1 to 255');
      if (!(this.value == null || typeof this.value == 'string')) errors.push('value must be null or a String');
      break;
    case 'Date':
      if (!(this.value == null || this.value instanceof Date)) errors.push('value must be null or a Date');
      break;
    case 'Boolean':
      if (!(this.value == null || typeof this.value == 'boolean')) errors.push('value must be null or a Boolean');
      break;
    case 'Number':
      if (!(this.value == null || typeof this.value == 'number')) errors.push('value must be null or a Number');
      break;
    case 'Model':
      if (!(this.value == null || this.value instanceof Model)) errors.push('value must be null or a Model');
      if (!(this.modelType instanceof Model)) errors.push('modelType must be instance of Model');
      break;
    case 'Group':
      if (this.value == null || this.value instanceof Array) {
        for (var i in this.value) {
          if (!(this.value[i] instanceof Attribute)) errors.push('each element in group must be instance of Attribute');
          if (this.value[i].getValidationErrors().length) errors.push('group contains invalid members');
        }
      } else {
        errors.push('value must be null or an array');
      }
      break;
    case 'Table':
      if (!(this.group instanceof Attribute)) {
        errors.push('group property required');
      } else {
        if (this.group.value instanceof Array) {
          if (this.group.value.length<1) {
            errors.push('group property value must contain at least one Attribute');
          } else {
            for (var i in this.group.value) {
              if (!(this.group.value[i] instanceof Attribute)) errors.push('each element in group must be instance of Attribute');
              if (this.group.value[i].getValidationErrors().length) errors.push('group contains invalid members');
            }
          }
        } else {
          errors.push('group.value must be an array');
        }
      }
      break;
    default:
      break;
  }
  return errors;
};
/*
 * Helpers
 */
function splitParens(str, outside, inside) {
  var tmpSplit = str.split('(');
  tmpSplit[1] = parseInt(tmpSplit[1]);
  return tmpSplit;
}
