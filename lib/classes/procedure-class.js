/**
 * tequila
 * procedure-class
 */
// Model Constructor
var Procedure = function (args) {
  if (false === (this instanceof Procedure)) throw new Error('new operator required');
  args = args || {};
};

//      if (!(this.contents instanceof Array)) throw new Error('contents must be array of tasks for procedure');
//      for (i in this.contents) {
//        var task = this.contents[i];
//        if (typeof task != 'object') throw new Error('contents must be array of menu items');
//        unusedProperties = T.getInvalidProperties(task, ['label', 'command', 'requires', 'timeout']);
//        var badJooJoo = [];
//        for (j = 0; j < unusedProperties.length; j++) badJooJoo.push('invalid property: ' + unusedProperties[j]);
//        if (badJooJoo.length > 1) throw new Error('error creating Command: multiple errors');
//        if (badJooJoo.length) throw new Error('contents[' + i + '] has ' + badJooJoo[0]);
//        if (!(task.command instanceof Command))
//          throw new Error('contents[' + i + '] must have valid command property set to Command');
//        // make sure requires valid if specified
//        if (!task.requires)
//          task.requires = -1;
//        if (!(task.requires instanceof Array)) task.requires = [task.requires]; // coerce to array
//        for (j in task.requires) {
//          switch (typeof task.requires[j]) {
//            case 'string':
//              throw new Error('wtf string requires in task[' + i + ']');
//              break;
//            case 'number':
//              if (task.requires[j] >= this.contents.length) throw new Error('missing task #' + task.requires[j] + ' for requires in task[' + i + ']');
//              if (task.requires[j] < -1) throw new Error('task #' + task.requires[j] + ' invalid requires in task[' + i + ']');
//              break;
//            default:
//              throw new Error('invalid type for requires in task[' + i + ']');
//          }
//        }
//      }
//      task.started = false;   // initial values before executing
//      task.completed = false;
//      task.results = null;
// fuck you bitch



