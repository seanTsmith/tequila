/**
 * tequila
 * memory-store-model
 */
// Constructor
var MemoryStore = function (args) {
  if (false === (this instanceof MemoryStore)) throw new Error('new operator required');
  Store.call(this, args);
  this.modelType = "MemoryStore";
  this.interface.canGetModel = true;
  this.interface.canPutModel = true;
  this.interface.canDeleteModel = true;
  this.data = [];
  this.idCounter = 0;
};
MemoryStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
MemoryStore.prototype.getModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  // Find model in memorystore, error out if can't find
  var modelIndex = -1;
  for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
  if (modelIndex < 0) {
    callBack(model, new Error('model not found in store'), self);
    return;
  }
  // Find the ID now
  var instanceIndex = -1;
  var id = model.getAttributeValue('id');
  var storedPair = this.data[modelIndex][1];
  for (var i = 0; instanceIndex<0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
  if (instanceIndex < 0) {
    callBack(model, new Error('id not found in store'), self);
    return;
  }
  callBack(storedPair[instanceIndex][1],undefined,self);
};
MemoryStore.prototype.putModel = function (model, callBack, self) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  var id = model.getAttributeValue('ID');
  if (id) {
    // Find model in memorystore, error out if can't find
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      callBack(model, new Error('model not found in store'), self);
      return;
    }
    // Find the ID now
    var instanceIndex = -1;
    var id = model.getAttributeValue('id');
    var storedPair = this.data[modelIndex][1];
    for (var i = 0; instanceIndex<0 && i < storedPair.length; i++) if (storedPair[i][0] == id) instanceIndex = i;
    if (instanceIndex < 0) {
      callBack(model, new Error('id not found in store'), self);
      return;
    }
    callBack(storedPair[instanceIndex][1],undefined,self);
  } else {
    // Find model in memorystore, add if not found
    var modelIndex = -1;
    for (var i = 0; i < this.data.length; i++) if (this.data[i][0] == model.modelType) modelIndex = i;
    if (modelIndex < 0) {
      this.data.push([model.modelType, [] ]);
      modelIndex = this.data.length - 1;
    }
    // Add the id and model to memory store
    var newID = ++this.idCounter;
    model.setAttributeValue('id',newID);
    this.data[modelIndex][1].push([newID, model]);
    callBack(model,undefined,self);
  }
};
MemoryStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model, new Error('model not found in store'));
};