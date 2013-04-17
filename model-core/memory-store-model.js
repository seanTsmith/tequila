/**
 * tequila
 * memory-store-model
 */

// Constructor
var MemoryStore = function () {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  Store.call(this);
  this.modelType = "MemoryStore";
  this.interface.getModel = true;
  this.store = {};
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
};
//MemoryStore.prototype.putModel = function (model /* {modelType:model} */) {
//};
//MemoryStore.prototype.deleteModel = function (model /* {modelType:modelID} */) {
//};
