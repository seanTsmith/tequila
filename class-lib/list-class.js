/**
 * tequila
 * list-class
 */

// Constructor
var List = function () {
  if (false === (this instanceof List)) throw new Error('new operator required');
  this.items = [];
};