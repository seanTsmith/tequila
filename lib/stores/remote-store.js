/**
 * tequila
 * remote-store
 */
// Constructor
var RemoteStore = function (args) {
  if (false === (this instanceof RemoteStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "RemoteStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeProperty = {
    isReady: false,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true,
    canGetList: true
  };
  var unusedProperties = T.getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);
};
/* istanbul ignore next */
RemoteStore.prototype = T.inheritPrototype(Store.prototype);
// Methods
/* istanbul ignore next */
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
        store.storeProperty.isReady = true;
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
/* istanbul ignore next */
RemoteStore.prototype.putModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callBack required');
  this.transport.send(new Message('PutModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(model);
    } else if (msg.type == 'PutModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        if (c.attributes.hasOwnProperty(a)) {
          var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
          attrib.value = c.attributes[a].value;
          model.attributes.push(attrib);
        }
      }
      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};
/* istanbul ignore next */
RemoteStore.prototype.getModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callBack != "function") throw new Error('callBack required');
  this.transport.send(new Message('GetModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(model);
    } else if (msg.type == 'GetModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        if (c.attributes.hasOwnProperty(a)) {
          var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
          attrib.value = c.attributes[a].value;
          model.attributes.push(attrib);
        }
      }
      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};
/* istanbul ignore next */
RemoteStore.prototype.deleteModel = function (model, callBack) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callBack != "function") throw new Error('callBack required');
  this.transport.send(new Message('DeleteModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(model);
    } else if (msg.type == 'DeleteModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        if (c.attributes.hasOwnProperty(a)) {
          var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
          attrib.value = c.attributes[a].value;
          model.attributes.push(attrib);
        }
      }
      if (typeof c == 'string')
        callBack(model, c);
      else
        callBack(model);
    } else {
      callBack(model, Error(msg));
    }
  });
};
/* istanbul ignore next */
RemoteStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callBack, order;
  if (typeof(arg4) == 'function') {
    callBack = arg4;
    order = arg3;
  } else {
    callBack = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callBack != "function") throw new Error('callBack required');
  this.transport.send(new Message('GetList', {list: list, filter: filter, order: order}), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callBack(list);
    } else if (msg.type == 'GetListAck') {
      list._items = msg.contents._items;
      list._itemIndex = msg.contents._itemIndex;
      callBack(list);
    } else {
      callBack(list, Error(msg));
    }
  });

};
// Message Handlers
/* istanbul ignore next */
T.setMessageHandler('PutModel', function putModelMessageHandler(messageContents, fn) {
  // create proxy for client model
  var ProxyPutModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        if (attrib.value != messageContents.attributes[a].value)
          attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyPutModel.prototype = T.inheritPrototype(Model.prototype); // Todo this is not a real class object may need to make factory builder
  var pm = new ProxyPutModel();
  var msg;
  hostStore.putModel(pm, function (model, error) {
    if (typeof error == 'undefined') {
      msg = new Message('PutModelAck', model);
    } else {
      console.log('ERROR: ' + error + "");
      msg = new Message('PutModelAck', error + "");
    }
    fn(msg);
  }, this);
});
/* istanbul ignore next */
T.setMessageHandler('GetModel', function getModelMessageHandler(messageContents, fn) {
  // create proxy for client model
  var ProxyGetModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyGetModel.prototype = T.inheritPrototype(Model.prototype);
  var pm = new ProxyGetModel();
  var msg;
  hostStore.getModel(pm, function (model, error) {
    if (typeof error == 'undefined') {
      msg = new Message('GetModelAck', model);
    } else {
      msg = new Message('GetModelAck', error + "");
    }
    fn(msg);
  }, this);
});
/* istanbul ignore next */
T.setMessageHandler('DeleteModel', function deleteModelMessageHandler(messageContents, fn) {
  // create proxy for client model
  var ProxyDeleteModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyDeleteModel.prototype = T.inheritPrototype(Model.prototype);
  var pm = new ProxyDeleteModel();
  var msg;
  hostStore.deleteModel(pm, function (model, error) {
    if (typeof error == 'undefined')
      msg = new Message('DeleteModelAck', model);
    else
      msg = new Message('DeleteModelAck', error);
    fn(msg);
  }, this);
});
/* istanbul ignore next */
T.setMessageHandler('GetList', function getListMessageHandler(messageContents, fn) {
  var proxyList = new List(new Model());
  proxyList.model.modelType = messageContents.list.model.modelType;
  proxyList.model.attributes = messageContents.list.model.attributes;
  var msg;
  function messageCallback(list, error) {
    if (typeof error == 'undefined')
      msg = new Message('GetListAck', list);
    else
      msg = new Message('GetListAck', error);
    fn(msg);
  }
  if (messageContents.order) {
    hostStore.getList(proxyList, messageContents.filter, messageContents.order, messageCallback);
  } else {
    hostStore.getList(proxyList, messageContents.filter, messageCallback);
  }
});
