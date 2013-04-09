/**
 * tequila
 * user-core-model
 */

// Model Constructor
var User = function () {
  if (false === (this instanceof User)) throw new Error('new operator required');
  Model.call(this);
  this.modelType = "User";
};
User.prototype = T.inheritPrototype(Model.prototype);