/**
 * tequila
 * presentation-model
 */
// Model Constructor
var Presentation = function (args) {
  if (false === (this instanceof Presentation)) throw new Error('new operator required');
  Model.call(this, args);
  this.modelType = "Presentation";
};
Presentation.prototype = T.inheritPrototype(Model.prototype);