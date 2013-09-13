/**
 * tequila
 * application-model
 */

// Model Constructor
var Application = function (args) {
  if (false === (this instanceof Application)) throw new Error('new operator required');
  Model.call(this, args);
  this.modelType = "Application";
  this.interface = new Interface();
};
Application.prototype = T.inheritPrototype(Model.prototype);
/*
 * Methods
 */
Application.prototype.run = function () {
  return new Command().execute();
};
Application.prototype.setInterface = function (interface) {
  if (false === (interface instanceof Interface)) throw new Error('instance of Interface a required parameter');
};
Application.prototype.getInterface = function () {
  return this.interface;
};
