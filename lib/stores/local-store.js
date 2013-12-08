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
  this.storeProperty = {
    isReady: false,
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false,
    canGetList: false
  };
  this.data = [];// Each ele is an array of model types and contents (which is an array of IDs and Model Value Store)
  this.idCounter = 0;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
LocalStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
