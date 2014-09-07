/**
 * tequila
 * application-model
 */

// Model Constructor
var Application = function (args) {
  if (false === (this instanceof Application)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  args.attributes.push(new Attribute({name: 'name', type: 'String(20)'}));
  args.attributes.push(new Attribute({name: 'brand', type: 'String'}));
  Model.call(this, args);
  this.modelType = "Application";
  this.set('name','newApp');
  this.set('brand','NEW APP');
};
Application.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Application.prototype.start = function (callBack) {
  if (false === (this.primaryInterface instanceof Interface)) throw new Error('error starting application: interface not set');
  if (typeof callBack != 'function') throw new Error('callBack required');
  var self = this;
  this.startCallback = callBack;
  this.primaryInterface.start(self, this.presentation, this.sysPresentation, function (request) {
    if (request.type=='Command') {
      request.command.execute();
    } else {
      if (self.startCallback) {
        self.startCallback(request);
      }
    }
  });
};
Application.prototype.dispatch = function (request, response) {
  if (false === (request instanceof Request)) throw new Error('Request required');
  if (response && typeof response != 'function') throw new Error('response callback is not a function');
  if (this.startCallback) {
    this.startCallback(request);
    return true;
  }
  return false;
};
Application.prototype.setInterface = function (primaryInterface) {
  if (false === (primaryInterface instanceof Interface)) throw new Error('instance of Interface a required parameter');
  this.primaryInterface = primaryInterface;
};
Application.prototype.getInterface = function () {
  return this.primaryInterface;
};
Application.prototype.setPresentation = function (presentation) {
  if (false === (presentation instanceof Presentation)) throw new Error('instance of Presentation a required parameter');
  this.presentation = presentation;
  if (this.startCallback) {
    // Interface started so reload
    this.primaryInterface.setPresentation(this.presentation);
  }
};
Application.prototype.getPresentation = function () {
  return this.presentation;
};