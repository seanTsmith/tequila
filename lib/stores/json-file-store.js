/**
 * tequila
 * json-file-store
 */

// Constructor
var JSONFileStore = function (args) {
  if (false === (this instanceof JSONFileStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "JSONFileStore";
  this.name = args.name || 'a ' + this.storeType;

  this.storeProperty = {
    isReady: T.isServer(),
    canGetModel: T.isServer(),
    canPutModel: T.isServer(),
    canDeleteModel: T.isServer(),
    canGetList: T.isServer()
  };
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);
};
JSONFileStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
