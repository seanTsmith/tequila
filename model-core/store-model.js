/**
 * tequila
 * store-core-model
 */

// Constructor
var Store = function () {
  if (false === (this instanceof Store)) throw new Error('new operator required');
  Model.call(this);
  this.modelType = "Store";
  this.interface = {
    getModel: false,
    putModel: false,
    deleteModel: false
  };
};
Store.prototype = T.inheritPrototype(Model.prototype);
// Methods
Store.prototype.getStoreInterface = function () {
  return this.interface;
};
Store.prototype.getModel = function (parm /* {modelType:modelID} */) {
  throw new Error('Store does not provide getModel');
};
Store.prototype.putModel = function (parm /* {modelType:model} */) {
  throw new Error('Store does not provide putModel');
};
Store.prototype.deleteModel = function (parm /* {modelType:modelID} */) {
  throw new Error('Store does not provide deleteModel');
};