/**
 * tequila
 * local-store
 */
// Constructor
var LocalStore = function (args) {
  if (false === (this instanceof LocalStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "LocalStore";
  this.name = args.name || 'a ' + this.storeType;
  var gotStore = typeof(Storage) !== "undefined";
  this.storeProperty = {
    isReady: gotStore,
    canGetModel: gotStore,
    canPutModel: gotStore,
    canDeleteModel: gotStore,
    canGetList: gotStore
  };
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
  if (gotStore) {
    localStorage.tequilaData = localStorage.tequilaData || [];
    localStorage.tequilaIDCounter = localStorage.tequilaIDCounter  || 0;
    if (localStorage.tequilaData) this.data = JSON.parse(localStorage.tequilaData);
    if (localStorage.tequilaIDCounter) this.idCounter = localStorage.tequilaIDCounter;
  }
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);
};
LocalStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
