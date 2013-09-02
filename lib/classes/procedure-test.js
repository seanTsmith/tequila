/**
 * tequila
 * procedure-test
 */
test.runnerProcedure = function () {
  test.heading('Procedure Class', function () {
    test.paragraph('The procedure class manages multiple commands and functions.');
    test.xexample('', false, function () {
      /* TODO
       PROPERTIES
         steps - An array of commands or function callbacks
         beginProcedure - callback called before first step executed
         beginStep - callback is executed before each step
         endStep - callback is executed after each step
         endProcedure - callback called after last step executed
         abortProcedure - callback called when procedure aborted - should clean up resources

       METHODS
         execute -
         abort -
         observe(callback)


       */
    });
  });
};


//      test.heading('Procedure', function () {
//        test.paragraph('Contents array of objects containing commands for execution.  Each array element is a "step" (object) with the following properties:');
//        test.example('for Procedure type contents array of objects for steps of procedure', undefined, function () {
//          // must be array
//          test.shouldThrow(Error('contents must be array of steps for procedure'), function () {
//            new Command({name: 'archiveData', type: 'Procedure'});
//          });
//          // type is checked
//          test.shouldThrow(Error('contents must be array of steps for procedure'), function () {
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
//        test.example('contents.label - optional label for this step of procedure', "Sex Bob-omb", function () {
//          var task = new Command({name: 'Bob'});
//          var job = new Command({name: 'Sex', type: 'Procedure', contents: [
//            {label: 'omb', command: task}
//          ]});
//          return job.name + ' ' + task.name + '-' + job.contents[0].label;
//        });
//        test.example('contents.command - command to execute for this step', undefined, function () {
//          new Command({name: 'archiveData', type: 'Procedure', contents: [
//            {command: new Command({})}
//          ]});
//        });
//        test.example('contents.requires - array of or single element of type string(label) number(array index) that ' +
//          'must complete before executing this step. Use -1 for previous step, null for no dependencies', undefined, function () {
//          test.shouldThrow(Error('invalid type for requires in step[0]'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {command: new Command({}), requires: new Date() }
//            ]});
//          });
//          // if number supplied it is index in array
//          test.shouldThrow(Error('missing step #1 for requires in step[0]'), function () {
//            new Command({name: 'archiveData', type: 'Procedure', contents: [
//              {command: new Command({}), requires: 1 }
//            ]});
//          });
//          test.shouldThrow(Error('step #-2 invalid requires in step[0]'), function () {
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
//        test.xexample('contents.started - set to true when step is started', undefined, function () {
//        });
//        test.xexample('contents.completed - set to true when the step is complete', undefined, function () {
//        });
//        test.xexample('contents.results - bucket to put any results', undefined, function () {
//        });
//        test.xexample('contents.timeout - maximum time given for task in ms - it not defined then value of maxTimeout', undefined, function () {
//        });
//      });