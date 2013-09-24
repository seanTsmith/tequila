/**
 * tequila
 * procedure-class
 */
// Model Constructor
var Procedure = function (args) {
  if (false === (this instanceof Procedure)) throw new Error('new operator required');
  args = args || {};
  var i;
  var unusedProperties = T.getInvalidProperties(args, ['tasks', 'tasksNeeded', 'tasksCompleted']);
  var badJooJoo = [];
  for (i = 0; i < unusedProperties.length; i++) badJooJoo.push('invalid property: ' + unusedProperties[i]);
  if (badJooJoo.length > 1)
    throw new Error('error creating Procedure: multiple errors');
  if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  // args ok, now copy to object and check for errors
  for (i in args)
    if (args.hasOwnProperty(i))
      this[i] = args[i];
  badJooJoo = this.getValidationErrors(); // before leaving make sure valid Attribute
  if (badJooJoo) {
    if (badJooJoo.length > 1) throw new Error('error creating Procedure: multiple errors');
    if (badJooJoo.length) throw new Error('error creating Procedure: ' + badJooJoo[0]);
  }
};
Procedure.prototype.getValidationErrors = function () {
  var i, j, k;
  var unusedProperties;
  if (this.tasks && !(this.tasks instanceof Array)) return ['tasks is not an array'];
  var badJooJoo = [];
  for (i in this.tasks) {
    if (this.tasks.hasOwnProperty(i)) {
      var task = this.tasks[i];
      unusedProperties = T.getInvalidProperties(task, ['label', 'command', 'requires', 'timeout']);
      for (j = 0; j < unusedProperties.length; j++) badJooJoo.push('invalid task[' + i + '] property: ' + unusedProperties[j]);
      if (typeof task.label != 'undefined' && typeof task.label != 'string')
        badJooJoo.push('task[' + i + '].label must be string');
      if (typeof task.command != 'undefined' && !(task.command instanceof Command))
        badJooJoo.push('task[' + i + '].command must be a Command object');
      // make sure requires valid if specified
      if (typeof task.requires == 'undefined')
        task.requires = -1; // default to
      if (!(task.requires instanceof Array)) task.requires = [task.requires]; // coerce to array
      for (j in task.requires) {
        if (task.requires.hasOwnProperty(j) && task.requires[j] != null)
          switch (typeof task.requires[j]) {
            case 'string':
              // make sure label exists
              var gotLabel = false;
              for (k=0; !gotLabel && k<this.tasks.length; k++ )
                if (task.requires[j] == this.tasks[k].label)
                  gotLabel = true;
              if (!gotLabel)
                throw new Error('missing label: ' + task.requires[j]);
              break;
            case 'number':
              if (task.requires[j] >= this.tasks.length) throw new Error('missing task #' + task.requires[j] + ' for requires in task[' + i + ']');
              if (task.requires[j] < -1) throw new Error('task #' + task.requires[j] + ' invalid requires in task[' + i + ']');
              break;
            default:
              throw new Error('invalid type for requires in task[' + i + ']');
          }
      }
    }
  }
  return badJooJoo.length ? badJooJoo : null;
};
