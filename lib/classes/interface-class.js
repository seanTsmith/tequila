/**
 * tequila
 * interface-class
 */
// Interface Constructor
function Interface(args) {
  if (false === (this instanceof Interface)) throw new Error('new operator required');
  args = args || {};
  args.name = args.name || '(unnamed)';
  args.description = args.description || 'a Interface';
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description', 'tasksCompleted']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1)
    throw new Error('error creating Procedure: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  // args ok, now copy to object and check for errors
  for (i in args) this[i] = args[i];
  badJooJoo = this.getValidationErrors(); // before leaving make sure valid Attribute
  if (badJooJoo) {
    if (badJooJoo.length > 1) throw new Error('error creating Procedure: multiple errors');
    if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  }
}
/*
 * Methods
 */
Interface.prototype.getValidationErrors = function () {
  var badJooJoo = [];
  return badJooJoo.length ? badJooJoo : null;
};
Interface.prototype.toString = function () {
  return this.description;
};
Interface.prototype.requestResponse = function (obj, callback) {
  if (obj == null || typeof obj !== 'object' || typeof callback !== 'function')
    throw new Error('requestResponse arguments required: object, callback');
  if (obj.request === undefined)
    throw new Error('requestResponse object has no request property');
  // Parameters are ok now handle the request
  setTimeout(function () {
    obj.response = new Error('invalid request: ' + obj.request);
    callback(obj);
  }, 0);
};
