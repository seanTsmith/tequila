/**
 * tequila
 * remote-store-model
 */
// Constructor
var RemoteStore = function (args) {
  if (false === (this instanceof RemoteStore)) throw new Error('new operator required');
  Store.call(this, args);
  this.modelType = "RemoteStore";
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
};
RemoteStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
