/**
 * tequila
 * presentation-model
 */
// Model Constructor
var Presentation = function (args) {
  if (false === (this instanceof Presentation)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  args.attributes.push(new Attribute({name: 'name', type: 'String'}));
  args.attributes.push(new Attribute({name: 'modelName', type: 'String'}));
  args.attributes.push(new Attribute({name: 'contents', type: 'Object', value: []}));
  Model.call(this, args);
  this.modelType = "Presentation";
};
Presentation.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Presentation.prototype.getValidationErrors = function (modelCheckOnly) {
  var i;
  var errors = Model.prototype.getValidationErrors.call(this);
  if (!modelCheckOnly && errors.length == 0) { // Only check if model it valid
    var contents = this.get('contents');
    var gotError = false;
    if (contents instanceof Array) {
      for (i=0; i<contents.length; i++) {
        if (!(contents[i] instanceof Command || contents[i] instanceof Attribute))
          gotError = true;
      }
      if (gotError)
        errors.push('contents elements must be Command or Attribute');
    } else {
      errors.push('contents must be Array');
    }
  }
  return errors;
};
