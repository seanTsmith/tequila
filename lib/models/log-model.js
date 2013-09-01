/**
 * tequila
 * log-model
 */

// Model Constructor
var Log = function (args) {
  if (false === (this instanceof Log)) throw new Error('new operator required');
  Model.call(this, args);
  this.modelType = "Log";
};
Log.prototype = T.inheritPrototype(Model.prototype);