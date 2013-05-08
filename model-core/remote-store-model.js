/**
 * tequila
 * remote-store-model
 */
// Constructor
var RemoteStore = function (args) {
  if (false === (this instanceof RemoteStore)) throw new Error('new operator required');
  Store.call(this, args);
  this.modelType = "RemoteStore";
  this.interface = {
    isReady: false,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true
  };
};
RemoteStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
RemoteStore.prototype.onConnect = function (location,callBack,self) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(undefined,new Error("not implemented"),self);
};
RemoteStore.prototype.getModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model, undefined, self);
};
RemoteStore.prototype.putModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
    callBack(model, undefined, self);
};
RemoteStore.prototype.deleteModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model, undefined, self);
};