/**
 * tequila
 * memory-store-model
 */
// Constructor
var MemoryStore = function (args) {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  Store.call(this,args);
  this.modelType = "MemoryStore";
  this.interface.canGetModel = true;
  this.interface.canPutModel = true;
  this.interface.canDeleteModel = true;
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model,callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model,new Error('model not found in store'));
};
MemoryStore.prototype.putModel = function (model,callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model,new Error('model not found in store'));
};
MemoryStore.prototype.deleteModel = function (model,callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model,new Error('model not found in store'));
};