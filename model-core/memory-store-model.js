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
MemoryStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model, new Error('model not found in store'));
};
MemoryStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  var id = model.getAttributeValue('ID');
  if (id) {
    callBack(model, new Error('model not found in store'));
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
    callBack(model);
  }
};
MemoryStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  callBack(model, new Error('model not found in store'));
};