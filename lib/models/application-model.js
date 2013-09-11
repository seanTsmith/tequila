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
Application.prototype.run = function () {
  return new Command().execute();
};
