/**
 * tequila
 * memory-store-model
 */

// Constructor
var MemoryStore = function (args) {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  Store.call(this,args);
  this.modelType = "MemoryStore";
  this.interface.getModel = true;
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model,callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');

//  throw new Error('cannot locate '+model.modelType+'('+model.attributes[0].value+')' + ' in ' + this.modelType);
};
//MemoryStore.prototype.putModel = function (model /* {modelType:model} */) {
//};
//MemoryStore.prototype.deleteModel = function (model /* {modelType:modelID} */) {
//};
