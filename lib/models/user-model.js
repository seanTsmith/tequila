/**
 * tequila
 * user-core-model
 */

// Model Constructor
var User = function (args) {
  if (false === (this instanceof User)) throw new Error('new operator required');
  Model.call(this,args);
  this.modelType = "User";
};
User.prototype = T.inheritPrototype(Model.prototype);