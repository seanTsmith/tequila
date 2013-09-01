/**
 * tequila
 * command-class
 */
// Command Constructor
function Command(args) {
  if (false === (this instanceof Command)) throw new Error('new operator required');
  args = args || {};
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description', 'type', 'contents', 'scope', 'executionErrors', 'beforeExecute', 'validate', 'afterExecute', 'stepTimeout']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Command: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Command: ' + badJooJoo[0]);
  for (i in args) this[i] = args[i];
  if ('undefined' == typeof this.name) throw new Error('name is required');
  if ('undefined' == typeof this.type) this.type = 'Stub';
  if (!T.contains(T.getCommandTypes(), this.type)) throw new Error('Invalid command type: ' + this.type);
}
/*
 * Methods
 */
Command.prototype.toString = function () {
  return 'Command: ' + this.name;
};
