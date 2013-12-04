/**
 * tequila
 * application-model
 */

// Model Constructor
var Application = function (args) {
  if (false === (this instanceof Application)) throw new Error('new operator required');
  Model.call(this, args);
  this.modelType = "Application";
};
Application.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Application.prototype.start = function () {
  if (false === (this.primaryInterface instanceof Interface)) throw new Error('error starting application: interface not set');
};
Application.prototype.setInterface = function (primaryInterface) {
  if (false === (primaryInterface instanceof Interface)) throw new Error('instance of Interface a required parameter');
  this.primaryInterface = primaryInterface;
};
Application.prototype.getInterface = function () {
  return this.primaryInterface;
};
