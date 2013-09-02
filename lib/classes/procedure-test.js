/**
 * tequila
 * procedure-test
 */
test.runnerProcedure = function () {
  test.heading('Procedure Class', function () {
    test.paragraph('The _Procedure_ Class manages a set of _Command_ instances.  It provides a pattern for handling ' +
      'asynchronous and synchronous tasks.  A task (_Command_) can have');
    test.xexample('', false, function () {
      /* TODO
       PROPERTIES
         tasks - An array of commands or function callbacks
         tasksNeeded - Total tasks that will execute (does not include skipped tasks)
         tasksCompleted - Number of tasks completed and started (does not include skipped tasks)

         ->status - app defined negative(FAIL) positive(SUCCESS) zero(WIP) null/undefined(BEFORE EXECUTION)
         ->timeout - default time for each task if not defined then set to system default
         ->bucket - app defined contents initial state null on execution
         ->onEvent(events,callback)
             beforeExecute - callback called before first task executed but after tasks initialized
             afterExecute - callback called after initial task(s) launched (see onCompletion)
             error - error occurred (return {errorClear:true})
             aborted - procedure aborted - should clean up resources
             completed - execution is complete check status property

       TASKS
         label - optional label for this task of procedure
         command - Command to execute for this task
         requires - array of or single element of type string(label) number(array index) that
         timeout - maximum time given for task in ms - it not defined then value of command used

       METHODS
         execute(observer callback) -
         abort -


       */
    });
  });
};


//      test.heading('Procedure', function () {
//        test.paragraph('Contents array of objects containing commands for execution.  Each array element is a "task" (object) with the following properties:');
//        test.example('for Procedure type contents array of objects for tasks of procedure', undefined, function () {
//          // must be array
//          test.shouldThrow(Error('contents must be array of tasks for procedure'), function () {
//            new Command({name: 'archiveData', type: 'Procedure'});
//          });
//          // type is checked
//          test.shouldThrow(Error('contents must be array of tasks for procedure'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: true});
//          });
//          // see valid properties in next examples - they are checked
//          test.shouldThrow(Error('contents[0] has invalid property: sex'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {sex: 'Bob-omb'}
//            ]});
//          });
//          // command property is required
//          test.shouldThrow(Error('contents[0] must have valid command property set to Command'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {}
//            ]});
//          });
//        });
//        test.example('contents.label - optional label for this task of procedure', "Sex Bob-omb", function () {
//          var task = new Command({name: 'Bob'});
//          var job = new Command({name: 'Sex', type: 'Procedure', contents: [
//            {label: 'omb', command: task}
//          ]});
//          return job.name + ' ' + task.name + '-' + job.contents[0].label;
//        });
//        test.example('contents.command - command to execute for this task', undefined, function () {
//          new Command({name: 'archiveData', type: 'Procedure', contents: [
//            {command: new Command({})}
//          ]});
//        });
//        test.example('contents.requires - array of or single element of type string(label) number(array index) that ' +
//          'must complete before executing this task. Use -1 for previous task, null for no dependencies', undefined, function () {
//          test.shouldThrow(Error('invalid type for requires in task[0]'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {command: new Command({}), requires: new Date() }
//            ]});
//          });
//          // if number supplied it is index in array
//          test.shouldThrow(Error('missing task #1 for requires in task[0]'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {command: new Command({}), requires: 1 }
//            ]});
//          });
//          test.shouldThrow(Error('task #-2 invalid requires in task[0]'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {command: new Command({}), requires: -2 }
//            ]});
//          });
//          // -1 means previous element is ignored for first index and is the default
//          // note: to explicitly set no
//          var cmd = new Command({name: 'archiveData', type: 'Procedure', contents: [
//            {command: new Command({})}
//          ]});
//          test.assertion(cmd.contents[0].requires == -1);
//        });
//        test.xexample('contents.started - set to true when task is started', undefined, function () {
//        });
//        test.xexample('contents.completed - set to true when the task is complete', undefined, function () {
//        });
//        test.xexample('contents.results - bucket to put any results', undefined, function () {
//        });
//        test.xexample('contents.timeout - maximum time given for task in ms - it not defined then value of maxTimeout', undefined, function () {
//        });
//      });
