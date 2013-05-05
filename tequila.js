// FILE IS DESTROYED AND REBUILT IN MAKE
/**
 * tequila
 * tequila-class.js
 */
var Tequila = (function () {
  var singletonInstance;
  function init() {
    // Private methods and variables
    var version = '0.0.1';
//    function privateMethod() {
//      console.log("I am private");
//    }
//    var privateVariable = "Im also private";
    var attributeTypes = ['ID', 'String', 'Date', 'Boolean', 'Number', 'Model', 'Group', 'Table'];
    return    {
      // Public methods and variables
      getVersion: function () {
        return version;
      },
      contains: function (a, obj) {
        for (var i = 0; i < a.length; i++) {
          if (a[i] === obj) return true;
        }
        return false;
      },
      getUnusedProperties: function (properties, allowedProperties) {
        var props = [];
        for (var property in properties) {
          if (!this.contains(allowedProperties, property)) {
            props.push(property);
          }
        }
        return props;
      },
      inheritPrototype: function(p) {
        if (p == null) throw TypeError();
        if (Object.create) return Object.create(p);
        var t = typeof p;
        if (t !== "object" && typeof t !== "function") throw TypeError();
        function f() {};
        f.prototype = p;
        return new f();
      },
      getAttributeTypes: function() {
        return attributeTypes;
      }
    };
  };
  return function () {
    if (!singletonInstance) singletonInstance = init();
    return singletonInstance;
  };
})();
// Library scoped ref to singleton
var T = Tequila();
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
        newValue =newValue.toUpperCase();
        if (newValue === 'Y' || newValue === 'YES' || newValue === 'T' || newValue === 'TRUE' || newValue === '1')
          return true;
        return false;
      }
      return (newValue == true);
      break;
  }
  throw(Error('coerce cannot determine appropriate value'))
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
          if (this.group.value.length < 1) {
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
/**
 * tequila
 * model-class
 */
// Model Constructor
var Model = function (args) {
  if (false === (this instanceof Model)) throw new Error('new operator required');
  this.modelType = "Model";
  this.attributes = [new Attribute('id','ID')];
  args = args || [];
  if (args.attributes) {
    for (var i in args.attributes) {
      this.attributes.push(args.attributes[i]);
    }
  }
  var unusedProperties = T.getUnusedProperties(args, ['attributes']);
  var badJooJoo = this.getValidationErrors(); // before leaving make sure valid Model
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Attribute: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Attribute: ' + badJooJoo[0]);
};
// Methods
Model.prototype.toString = function () {
  return "a " + this.modelType;
};

Model.prototype.copy = function (sourceModel) {
  for (var i in this.attributes) {
    this.attributes[i].value = sourceModel.attributes[i].value;
  }
}
Model.prototype.getValidationErrors = function () {
  var errors = [];
  // check attributes
  if (!(this.attributes instanceof Array)) {
    errors.push('attributes must be Array');
  } else {
    if (this.attributes.length<1) {
      errors.push('attributes must not be empty');
    } else {
      for (var i = 0; i < this.attributes.length; i++) {
        if (i == 0 && (!(this.attributes[i] instanceof Attribute) || this.attributes[i].type != "ID")) errors.push('first attribute must be ID');
        if (!(this.attributes[i] instanceof Attribute)) errors.push('attribute must be Attribute');
      }
    }
  }
  // check tags
  if (this.tags !== undefined && !(this.tags instanceof Array)) {
    errors.push('tags must be Array or null');
  }
  return errors;
};
Model.prototype.getAttributeValue = function(attribute) {
  for (var i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name.toUpperCase() == attribute.toUpperCase())
      return this.attributes[i].value;
  }
};
Model.prototype.setAttributeValue = function(attribute,value) {
  for (var i = 0; i < this.attributes.length; i++) {
    if (this.attributes[i].name.toUpperCase() == attribute.toUpperCase()) {
      this.attributes[i].value = value;
      return;
    }
  }
  throw new Error('attribute not valid for model');
};/**
 * tequila
 * list-class
 */

// Constructor
var List = function () {
  if (false === (this instanceof List)) throw new Error('new operator required');
  this.items = [];
};/**
 * tequila
 * user-core-model
 */

// Model Constructor
var User = function (args) {
  if (false === (this instanceof User)) throw new Error('new operator required');
  Model.call(this,args);
  this.modelType = "User";
};
User.prototype = T.inheritPrototype(Model.prototype);/**
 * tequila
 * store-core-model
 */

// Constructor
var Store = function (args) {
  if (false === (this instanceof Store)) throw new Error('new operator required');
  Model.call(this,args);
  this.modelType = "Store";
  this.interface = {
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false
  };
};
Store.prototype = T.inheritPrototype(Model.prototype);
// Methods
Store.prototype.getStoreInterface = function () {
  return this.interface;
};
Store.prototype.getModel = function (parm /* {modelType:modelID} */) {
  throw new Error(this.modelType + ' does not provide getModel');
};
Store.prototype.putModel = function (parm /* {modelType:model} */) {
  throw new Error('Store does not provide putModel');
};
Store.prototype.deleteModel = function (parm /* {modelType:modelID} */) {
  throw new Error('Store does not provide deleteModel');
};/**
 * tequila
 * memory-store-model
 */
// Constructor
var MemoryStore = function (args) {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  Store.call(this, args);
  this.modelType = "MemoryStore";
  this.interface.canGetModel = true;
  this.interface.canPutModel = true;
  this.interface.canDeleteModel = true;
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'), self);
    return;
  }
  // Find the ID now and put in instanceIndex
  var id = model.getAttributeValue('id');
  var storedPair = this.data[modelIndex][1];
  var instanceIndex = -1;
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'), self);
    return;
  }
  // Copy values from store to ref model
  var storeValues = storedPair[instanceIndex][1];
  for (var a in model.attributes) {
    model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callBack(model, undefined, self);
};
MemoryStore.prototype.putModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');

  var id = model.getAttributeValue('ID');
  if (id) {
    // Find model in memorystore, error out if can't find
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      callBack(model, new Error('model not found in store'), self);
      return;
    }
    // Find the ID now
    var instanceIndex = -1;
    var id = model.getAttributeValue('id');
    var storedPair = this.data[modelIndex][1];
    for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
    if (instanceIndex < 0) {
      callBack(model, new Error('id not found in store'), self);
      return;
    }
    // Copy from store
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    storedPair[instanceIndex][1] = ModelValues;
    callBack(model, undefined, self);
  } else {
    // Find model in memorystore, add if not found
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      this.data.push([model.modelType, [] ]);
      modelIndex = this.data.length - 1;
    }
    // Add the id and model to memory store
    var newID = ++this.idCounter;
    model.setAttributeValue('id', newID);
    var ModelValues = {};
    for (var a in model.attributes) {
      var theName = model.attributes[a].name;
      var theValue = model.attributes[a].value;
      ModelValues[theName] = theValue;
    }
    this.data[modelIndex][1].push([newID, ModelValues]);
    callBack(model, undefined, self);
  }

};
MemoryStore.prototype.deleteModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'), self);
    return;
  }
  // Find the ID now
  var instanceIndex = -1;
  var id = model.getAttributeValue('id');
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; instanceIndex < 0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'), self);
    return;
  }
  // Splice out the stored values then prepare that Model for callback with ID stripped
  //var storeValues = storedPair[instanceIndex][1];
  var storeValues = storedPair.splice(instanceIndex,1)[0][1];
  for (var a in model.attributes) {
    if (model.attributes[a].name=='id')
      model.attributes[a].value = undefined;
    else
      model.attributes[a].value = storeValues[model.attributes[a].name];
  }
  callBack(model, undefined, self);
};