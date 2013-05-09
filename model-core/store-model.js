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
    isReady: true,
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
Store.prototype.onConnect = function (location,callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(this,undefined);
};
Store.prototype.getModel = function (parm) {
  throw new Error(this.modelType + ' does not provide getModel');
};
Store.prototype.putModel = function (parm) {
  throw new Error('Store does not provide putModel');
};
Store.prototype.deleteModel = function (parm) {
  throw new Error('Store does not provide deleteModel');
};