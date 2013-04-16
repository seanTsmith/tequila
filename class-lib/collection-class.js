/**
 * tequila
 * collection-class
 */

// Model Constructor
var Collection = function () {
  if (false === (this instanceof Collection)) throw new Error('new operator required');
  this.attributes = [];
};