/**
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
};