/**
 * tequila
 * presentation-model
 */
// Model Constructor
var Presentation = function (args) {
  if (false === (this instanceof Presentation)) throw new Error('new operator required');
  args = args || {};
  if (!args.attributes) {
    args.attributes = [];
  }
  args.attributes.push(new Attribute({name: 'name', type: 'String(20)'}));
  Model.call(this, args);
  this.modelType = "Presentation";
};
Presentation.prototype = T.inheritPrototype(Model.prototype);