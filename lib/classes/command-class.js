/**
 * tequila
 * command-class
 */
// Command Constructor
function Command(/* does this matter */ args) {
  if (false === (this instanceof Command)) throw new Error('new operator required');
  args = args || {};
  var i, j, k;
  var unusedProperties = T.getInvalidProperties(args, ['name', 'description', 'type', 'contents', 'scope', 'executionErrors', 'beforeExecute', 'validate', 'afterExecute', 'stepTimeout']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1) throw new Error('error creating Command: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Command: ' + badJooJoo[0]);
  for (i in args) this[i] = args[i];
  this.name = this.name || "(unnamed)"; // name is optional
  if ('string' != typeof this.name) throw new Error('name must be string');
  if ('undefined' == typeof this.description) this.description = this.name;
  if ('undefined' == typeof this.type) this.type = 'Stub';
  if (!T.contains(T.getCommandTypes(), this.type)) throw new Error('Invalid command type: ' + this.type);
  switch (this.type) {
    case 'Stub':
      break;
    case 'Menu':
      if (!(this.contents instanceof Array)) throw new Error('contents must be array of menu items');
      if (!this.contents.length) throw new Error('contents must be array of menu items');
      for (i in this.contents) {
        if (typeof this.contents[i] != 'string' && !(this.contents[i] instanceof Command))
          throw new Error('contents must be array of menu items');
      }
      break;
    case 'Presentation':
      if (!(this.contents instanceof Presentation)) throw new Error('contents must be a Presentation');
      break;
    case 'Function':
      if (typeof this.contents != 'function') throw new Error('contents must be a Function');
      break;
    case 'Procedure':
      if (!(this.contents instanceof Array)) throw new Error('contents must be array of steps for procedure');
      for (i in this.contents) {
        var step = this.contents[i];
        if (typeof step != 'object') throw new Error('contents must be array of menu items');
        unusedProperties = T.getInvalidProperties(step, ['label', 'command', 'requires', 'timeout']);
        var badJooJoo = [];
        for (j = 0; j < unusedProperties.length; j++) badJooJoo.push('invalid property: ' + unusedProperties[j]);
        if (badJooJoo.length > 1) throw new Error('error creating Command: multiple errors');
        if (badJooJoo.length) throw new Error('contents[' + i + '] has ' + badJooJoo[0]);
        if (!(step.command instanceof Command))
          throw new Error('contents[' + i + '] must have valid command property set to Command');
        // make sure requires valid if specified
        if (!step.requires)
          step.requires = -1;
        if (!(step.requires instanceof Array)) step.requires = [step.requires]; // coerce to array
        for (j in step.requires) {
          switch (typeof step.requires[j]) {
            case 'string':
              throw new Error('wtf string requires in step[' + i + ']');
              break;
            case 'number':
              if (step.requires[j] >= this.contents.length) throw new Error('missing step #' + step.requires[j] + ' for requires in step[' + i + ']');
              if (step.requires[j] < -1) throw new Error('step #' + step.requires[j] + ' invalid requires in step[' + i + ']');
              break;
            default:
              throw new Error('invalid type for requires in step[' + i + ']');
          }
        }
      }
      step.started = false;   // initial values before executing
      step.completed = false;
      step.results = null;
      break;
  }
  if ('undefined' != typeof this.scope)
    if (!((this.scope instanceof Model) || (this.scope instanceof List)))
      throw new Error('optional scope property must be Model or List');
  if ('undefined' != typeof this.beforeExecute)
    if (typeof this.beforeExecute != 'function') throw new Error('beforeExecute must be a Function');
  if ('undefined' != typeof this.afterExecute)
    if (typeof this.afterExecute != 'function') throw new Error('afterExecute must be a Function');
  if ('undefined' != typeof this.stepTimeout)
    if (typeof this.stepTimeout != 'Number') throw new Error('stepTimeout must be a Number');
}
/*
 * Methods
 */
Command.prototype.toString = function () {
  return this.type + ' Command: ' + this.name;
};
