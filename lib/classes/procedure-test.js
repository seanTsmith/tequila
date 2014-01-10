/**
 * tequila
 * procedure-test
 */
test.runnerProcedure = function () {
  test.heading('Procedure Class', function () {
    test.paragraph('The _Procedure_ class manages a set of _Command_ objects.  It provides a pattern for handling ' +
      'asynchronous and synchronous command execution.');
    test.paragraph('_Command_ objects create and manage the _Procedure_ object.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Procedure', true, function () {
        return new Procedure() instanceof Procedure;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Procedure();
      });
      test.example('should make sure argument properties are valid', Error('error creating Procedure: invalid property: yo'), function () {
        new Procedure({yo: 'whatup'});
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('tasks', function () {
        test.paragraph('Tasks is an array of objects that represent each step of the procedure.  See TASKS section ' +
          'below for each property of this unnamed object (task array element).');
        test.example('tasks can be falsy if no tasks defined otherwise it has to be an array',
          Error('error creating Procedure: tasks is not an array'), function () {
            new Procedure({tasks: true});
          });
        test.example('the parameters must be valid for the object in each element of the array',
          Error('error creating Procedure: invalid task[0] property: clean'), function () {
          new Procedure({tasks: [
            {clean: 'room'}
          ]})
        });
      });
      test.heading('tasksNeeded', function () {
        test.paragraph('Total tasks that will execute (does not include skipped tasks).');
        test.paragraph('_See Integration Tests for usage_');
      });
      test.heading('tasksCompleted', function () {
        test.paragraph('Number of tasks completed and started (does not include skipped tasks)');
        test.paragraph('_See Integration Tests for usage_');
      });
    });
    test.heading('TASKS', function () {
      test.paragraph('Each element of the array tasks is an object with the following properties:');
      test.heading('label', function () {
        test.paragraph('optional label for this task task element');
        test.example('if used it must be a string', Error('error creating Procedure: task[0].label must be string'), function () {
          new Procedure({tasks: [
            {label: true}
          ]});
        });
      });
      test.heading('command', function () {
        test.paragraph('Command to execute for this task');
        test.example('if used it must be a string', Error('error creating Procedure: task[0].command must be a Command object'), function () {
          new Procedure({tasks: [
            {command: true}
          ]});
        });
      });
      test.heading('requires', function () {
        test.paragraph('Establish other tasks that must be complete before this task is executed.  ' +
          'Pass as array of or single element. Can be string(for label label) or number(for array index).  ' +
          'Use -1 for previous task, null for no dependencies');
        test.example('test it', undefined, function () {
          test.shouldThrow(Error('invalid type for requires in task[0]'), function () {
            new Procedure({tasks: [
              {requires: new Date() }
            ]});
          });
          // if number supplied it is index in array
          test.shouldThrow(Error('missing task #1 for requires in task[0]'), function () {
            new Procedure({tasks: [
              {command: new Procedure({}), requires: 1 }
            ]});
          });
          test.shouldThrow(Error('task #-2 invalid requires in task[0]'), function () {
            new Procedure({tasks: [
              {command: new Procedure({}), requires: -2 }
            ]});
          });
          // requires defaults to -1 which means the previous element in the array so essentially the default
          // is sequential processing.  Set to null for no dependencies which makes it asynchronous -1 means
          // previous element is ignored for first index and is the default
          var proc = new Procedure({tasks: [
            {command: new Command({})}
          ]});
          test.assertion(proc.tasks[0].requires == -1);
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('getValidationErrors', function () {
        test.example('should return array of validation errors', 'falsy', function () {
          if (!new Procedure().getValidationErrors()) return 'falsy'
        });
      });
    });
    test.runnerProcedureIntegration();
  });
};
