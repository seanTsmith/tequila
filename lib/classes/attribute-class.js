/**
 * tequila
 * attribute-class
 */
/*
 * Constructor
 */
function Attribute(args, arg2) {
  var splitTypes; // For String(30) type
  if (false === (this instanceof Attribute)) throw new Error('new operator required');
  if (typeof args == 'string') {
    var quickName = args;
    args = {};
    args.name = quickName;
    if (typeof arg2 == 'string') {
      args.type = arg2;
    }
  }
  args = args || {};
  this.name = args.name || null;
  this.label = args.label || args.name;
  if (this.label)
    this.label = this.label.charAt(0).toUpperCase() + this.label.slice(1);
  this.type = args.type || 'String';
  splitTypes = function (str) { // for String(30) remove right of (
    var tmpSplit = str.split('(');
    tmpSplit[1] = parseInt(tmpSplit[1]);
    return tmpSplit;
  }(this.type);
  this.type = splitTypes[0];
  this.hint = args.hint || {};
  var unusedProperties = [];
  switch (this.type) {
    case 'ID':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'value']);
      this.value = args.value || null;
      break;
    case 'String':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'placeHolder', 'quickPick', 'value', 'size']);
      this.size = splitTypes[1] ? splitTypes[1] : typeof args.size == 'number' ? args.size : args.size || 50;
      this.value = args.value || null;
      if (args.quickPick)
        this.quickPick = args.quickPick;
      this.placeHolder = args.placeHolder || null;
      break;
    case 'Date':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'placeHolder', 'value']);
      this.value = args.value || null;
      this.placeHolder = args.placeHolder || null;
      break;
    case 'Boolean':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'value']);
      this.value = args.value || null;
      break;
    case 'Number':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'placeHolder', 'value']);
      this.value = args.value || null;
      this.placeHolder = args.placeHolder || null;
      break;
    case 'Model':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'value']);
      this.value = args.value || null;
      if (this.value instanceof Attribute.ModelID)
        this.modelType = this.value.modelType;
      break;
    case 'Group':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'value']);
      this.value = args.value || null;
      break;
    case 'Table':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'value', 'group']);
      this.value = args.value || null;
      this.group = args.group || null;
      break;
    case 'Object':
      unusedProperties = T.getInvalidProperties(args, ['name', 'type', 'label', 'hint', 'value']);
      this.value = args.value || null;
      break;

    default:
      break;
  }
  var errorList = this.getObjectStateErrors(); // before leaving make sure valid Attribute
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Attribute: multiple errors');
  if (errorList.length) throw new Error('error creating Attribute: ' + errorList[0]);

  // Validations done
  this._eventListeners = [];
  this._errorConditions = {};
}
/*
 * Additional Constructors
 */
Attribute.ModelID = function (model) {
  if (false === (this instanceof Attribute.ModelID)) throw new Error('new operator required');
  if (false === (model instanceof Model)) throw new Error('must be constructed with Model');
  this.value = model.get('id');
  this.constructorFunction = model.constructor;
  this.modelType = model.modelType;
};
Attribute.ModelID.prototype.toString = function () {
  if (typeof this.value == 'string')
    return 'ModelID(' + this.modelType + ':\'' + this.value + '\')';
  else
    return 'ModelID(' + this.modelType + ':' + this.value + ')';
};
/*
 * Methods
 */
Attribute.prototype.toString = function () {
  return this.name === null ? 'new Attribute' : 'Attribute: ' + this.name;
};
Attribute.prototype.onEvent = function (events, callback) {
  if (!(events instanceof Array)) {
    if (typeof events != 'string') throw new Error('subscription string or array required');
    events = [events]; // coerce to array
  }
  if (typeof callback != 'function') throw new Error('callback is required');
  // Check known Events
  for (var i in events) {
    if (events.hasOwnProperty(i))
      if (events[i] != '*')
        if (!T.contains(T.getAttributeEvents(), events[i]))
          throw new Error('Unknown command event: ' + events[i]);
  }
  // All good add to chain
  this._eventListeners.push({events: events, callback: callback});
  return this;
};
Attribute.prototype._emitEvent = function (event) {
  var i;
  for (i in this._eventListeners) {
    if (this._eventListeners.hasOwnProperty(i)) {
      var subscriber = this._eventListeners[i];
      if ((subscriber.events.length && subscriber.events[0] === '*') || T.contains(subscriber.events, event)) {
        subscriber.callback.call(this, event);
      }
    }
  }
};
Attribute.prototype.coerce = function (value) {
  var newValue = value;
  var temp;
  switch (this.type) {
    case 'String':
      if (typeof newValue == 'undefined') return '';
      if (typeof newValue == 'boolean' && !newValue) return 'false';
      if (!newValue) return '';
      newValue = value.toString();
      if (newValue.length > this.size) return newValue.substring(0, this.size);
      return newValue;
      break;
    case 'Number':
      if (typeof newValue == 'undefined') return 0;
      if (!newValue) return 0;
      if (typeof newValue == 'string') {
        newValue = newValue.replace(/^\s+|\s+$/g, ''); // trim
        temp = newValue.split(' ');
        newValue = temp.length ? temp[0] : '';
        newValue = Number(newValue.replace(/[^/0-9\ \.]+/g, ""));
      } else {
        newValue = Number(newValue);
      }
      if (!newValue) return 0;
      return newValue;
      break;
    case 'Boolean':
      if (typeof newValue == 'undefined') return false;
      if (typeof newValue == 'string') {
        newValue = newValue.toUpperCase();
        if (newValue === 'Y' || newValue === 'YES' || newValue === 'T' || newValue === 'TRUE' || newValue === '1')
          return true;
        return false;
      }
      return (newValue == true);
      break;
    case 'Date':
      if (typeof newValue == 'string') {
        if (newValue.split('/').length==2)
          newValue = newValue + '/' + new Date().getFullYear();

      }
      return new Date(newValue);
      break;
  }
  throw(Error('coerce cannot determine appropriate value'))
};
Attribute.prototype.getObjectStateErrors = function () {
  this.validationErrors = [];
  if (!this.name) this.validationErrors.push('name required');
  if (!T.contains(T.getAttributeTypes(), this.type))
    this.validationErrors.push('Invalid type: ' + this.type);
  switch (this.type) {
    case 'ID':
      break;
    case 'String':
      if (typeof this.size != 'number') this.validationErrors.push('size must be a number from 1 to 255');
      if (this.size < 1 || this.size > 255) this.validationErrors.push('size must be a number from 1 to 255');
      if (!(this.value == null || typeof this.value == 'string')) this.validationErrors.push('value must be null or a String');
      break;
    case 'Date':
      if (!(this.value == null || this.value instanceof Date)) this.validationErrors.push('value must be null or a Date');
      break;
    case 'Boolean':
      if (!(this.value == null || typeof this.value == 'boolean')) this.validationErrors.push('value must be null or a Boolean');
      break;
    case 'Number':
      if (!(this.value == null || typeof this.value == 'number')) this.validationErrors.push('value must be null or a Number');
      break;
    case 'Model':
      if (!(this.value instanceof Attribute.ModelID)) this.validationErrors.push('value must be Attribute.ModelID');
      break;
    case 'Group':
      if (this.value == null || this.value instanceof Array) {
        for (var i in this.value) {
          if (this.value.hasOwnProperty(i)) {
            if (!(this.value[i] instanceof Attribute)) this.validationErrors.push('each element in group must be instance of Attribute');
            if (this.value[i].getObjectStateErrors().length) this.validationErrors.push('group contains invalid members');
          }
        }
      } else {
        this.validationErrors.push('value must be null or an array');
      }
      break;
    case 'Table':
      if (!(this.group instanceof Attribute)) {
        this.validationErrors.push('group property required');
      } else {
        if (this.group.value instanceof Array) {
          if (this.group.value.length < 1) {
            this.validationErrors.push('group property value must contain at least one Attribute');
          } else {
            for (var i in this.group.value) {
              if (this.group.value.hasOwnProperty(i)) {
                if (!(this.group.value[i] instanceof Attribute)) this.validationErrors.push('each element in group must be instance of Attribute');
                if (this.group.value[i].getObjectStateErrors().length) this.validationErrors.push('group contains invalid members');
              }
            }
          }
        } else {
          this.validationErrors.push('group.value must be an array');
        }
      }
      break;
    default:
      break;
  }
  this.validationMessage = this.validationErrors.length > 0 ? this.validationErrors[0] : '';
  return this.validationErrors;
};
Attribute.prototype.validate = function (callBack) {
  if (typeof callBack != 'function') throw new Error('callback is required');
  this.getObjectStateErrors();
  this._emitEvent('Validate');
  var e;
  for (e in this._errorConditions) {
    if (this._errorConditions.hasOwnProperty(e)) {
      this.validationErrors.push(this._errorConditions[e]);
    }
  }
  if (this.hint.required && !this.value)
    this.validationErrors.push(this.label + ' required');

  this.validationMessage = this.validationErrors.length > 0 ? this.validationErrors[0] : '';
  this._emitEvent('StateChange');
  callBack.call(this);
};
Attribute.prototype.setError = function (condition, description) {
  condition = condition || '';
  description = description || '';
  if (!condition) throw new Error('condition required');
  if (!description) throw new Error('description required');
  this._errorConditions[condition] = description;
};
Attribute.prototype.clearError = function (condition) {
  condition = condition || '';
  if (!condition) throw new Error('condition required');
  delete this._errorConditions[condition];
};