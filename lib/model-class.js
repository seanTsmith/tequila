/**
 * tequila
 * model-class
 */

// Model Constructor
var Model = function () {
  if (false === (this instanceof Model)) throw new Error('new operator required');
  this.modelType = "Model";
  this.attributes = [];
};

/*
 * Virtual Methods no chaining needed
 */
Model.prototype.toString = function () {
  return "a " + this.modelType;
};
Model.prototype.getName = function () {
  return "(unknown " + this.modelType + ")";
};
Model.prototype.getSearchString = function () {
  return this.searchString || this.getName();
};
Model.prototype.setSearchString = function (searchString) {
  this.searchString = searchString;
};
/*
 * Virtual Methods subclass must invoke first
 */
Model.prototype.getValidationErrors = function () {
  var errors = [];
  if (!(this.attributes instanceof Array)) {
    errors.push('attributes must be Array');
  } else {
    for (var i = 0; i < this.attributes.length; i++) {
      if (i == 0 && (!(this.attributes[i] instanceof Attribute) || this.attributes[i].type != "ID")) errors.push('first attribute must be ID');
      if (!(this.attributes[i] instanceof Attribute)) errors.push('attribute must be Attribute');
    }
  }
  return errors;
};
