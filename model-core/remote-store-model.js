/**
 * tequila
 * remote-store-model
 */
// Constructor
var RemoteStore = function (args) {
  if (false === (this instanceof RemoteStore)) throw new Error('new operator required');
  args = args || [];
  this.storeType = args.storeType || "RemoteStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeInterface = {
    isReady: false,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true
  };
  var unusedProperties = T.getUnusedProperties(args, ['name', 'storeType']);
  var badJooJoo = [];
  for (var i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Store: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Store: ' + badJooJoo[0]);
};
RemoteStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
RemoteStore.prototype.onConnect = function (location, callBack) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  var store = this;
  try {
    this.transport = new Transport(location, function (msg) {
      if (msg.type == 'Error') {
        console.log('Transport connect error: ' + store.name);
        callBack(undefined, new Error(msg.contents));
        return;
      }
      if (msg.type == 'Connected') {
        console.log('Transport connected: ' + store.name);
        callBack(store);
        return;
      }
      console.log('Transport unexpected message type: ' + store.name);
      callBack(undefined, new Error('unexpected message type: ' + msg.type));
    });
  }
  catch (err) {
    callBack(undefined, err);
  }
};
RemoteStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('PutModel',model), function (msg) {
    if (msg == 'Ack') {
      callBack(model);
    } else if (msg.type == 'PutModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        var attrib = new Attribute(c.attributes[a].name,c.attributes[a].type);
        attrib.value = c.attributes[a].value;
        model.attributes.push(attrib);
      }
      console.log('putModel: ' + JSON.stringify(model));
      callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};RemoteStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('GetModel',model), function (msg) {
    if (msg == 'Ack') {
      callBack(model);
    } else if (msg.type == 'GetModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        var attrib = new Attribute(c.attributes[a].name,c.attributes[a].type);
        attrib.value = c.attributes[a].value;
        model.attributes.push(attrib);
      }
      console.log('getModel model: ' + JSON.stringify(model));
      console.log('getModel msg: ' + JSON.stringify(msg));

      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};

RemoteStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getValidationErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callback required');
  this.transport.send(new Message('DeleteModel',model), function (msg) {
    if (msg == 'Ack') {
      callBack(model);
    } else if (msg.type == 'DeleteModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        var attrib = new Attribute(c.attributes[a].name,c.attributes[a].type);
        attrib.value = c.attributes[a].value;
        model.attributes.push(attrib);
      }
      console.log('DeleteModel: ' + JSON.stringify(model));
      callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};