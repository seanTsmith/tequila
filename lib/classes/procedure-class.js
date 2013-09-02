/**
 * tequila
 * procedure-class
 */
// Model Constructor
var Procedure = function (args) {
  if (false === (this instanceof Procedure)) throw new Error('new operator required');
  Model.call(this, args);
  this.modelType = "Procedure";
};
Procedure.prototype = T.inheritPrototype(Model.prototype);
//      if (!(this.contents instanceof Array)) throw new Error('contents must be array of steps for procedure');
//      for (i in this.contents) {
//        var step = this.contents[i];
//        if (typeof step != 'object') throw new Error('contents must be array of menu items');
//        unusedProperties = T.getInvalidProperties(step, ['label', 'command', 'requires', 'timeout']);
//        var badJooJoo = [];
//        for (j = 0; j < unusedProperties.length; j++) badJooJoo.push('invalid property: ' + unusedProperties[j]);
//        if (badJooJoo.length > 1) throw new Error('error creating Command: multiple errors');
//        if (badJooJoo.length) throw new Error('contents[' + i + '] has ' + badJooJoo[0]);
//        if (!(step.command instanceof Command))
//          throw new Error('contents[' + i + '] must have valid command property set to Command');
//        // make sure requires valid if specified
//        if (!step.requires)
//          step.requires = -1;
//        if (!(step.requires instanceof Array)) step.requires = [step.requires]; // coerce to array
//        for (j in step.requires) {
//          switch (typeof step.requires[j]) {
//            case 'string':
//              throw new Error('wtf string requires in step[' + i + ']');
//              break;
//            case 'number':
//              if (step.requires[j] >= this.contents.length) throw new Error('missing step #' + step.requires[j] + ' for requires in step[' + i + ']');
//              if (step.requires[j] < -1) throw new Error('step #' + step.requires[j] + ' invalid requires in step[' + i + ']');
//              break;
//            default:
//              throw new Error('invalid type for requires in step[' + i + ']');
//          }
//        }
//      }
//      step.started = false;   // initial values before executing
//      step.completed = false;
//      step.results = null;