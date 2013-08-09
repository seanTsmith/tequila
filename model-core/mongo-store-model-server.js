/**
 * tequila
 * mongo-store-model-server
 */

// Methods (Server Side Only)

MongoStore.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(this, undefined);
};
MongoStore.prototype.getModel = function (parm) {
  throw new Error(this.storeType + ' does not prodvide getModel');
};
MongoStore.prototype.putModel = function (parm) {
  throw new Error('Store does not provide pdutModel');
};
MongoStore.prototype.deleteModel = function (parm) {
  throw new Error('Store does not provide deletdeModel');
};