/**
 * tequila
 * command-test
 */
test.runnerCommand = function () {
  test.heading('Command Class', function () {
    test.paragraph('The command design pattern is implemented with this class.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Command', true, function () {
        return new Command({name: 'about'}) instanceof Command;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Command({name: 'about'});
      });
      test.example('should make sure argument properties are valid', Error('error creating Command: invalid property: sex'), function () {
        new Command({name: 'name', sex: 'female'});
      });
      test.example('name argument required', Error('name is required'), function () {
        new Command();
      });
      test.example('defaults type to "Stub"', 'Stub', function () {
        return new Command({name: 'about'}).type;
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('name', function () {
        test.example('identifier name for command', 'about', function () {
          return new Command({name: 'about'}).name;
        });
      });
      test.heading('description', function () {
        test.example('more descriptive than name (for menus)', 'about Tequila', function () {
          return new Command({name: 'about', description: 'about Tequila'}).description;
        });
      });
      test.heading('type', function () {
        test.example('type of command must be valid', Error('Invalid command type: magic'), function () {
          test.show(T.getCommandTypes());
          new Command({name: 'about', type: 'magic' });
        });
      });
      test.heading('contents', function () {
        test.paragraph('based on type this may contain data');
      });
      test.heading('scope', function () {
        test.paragraph('this can be a model that command applies to or a list');
      });
      test.heading('executionErrors', function () {
        test.paragraph('any truthy value considered an error, this value is considered valid when afterExecute is invoked to determine success of command');
      });
      test.heading('beforeExecute', function () {
        test.paragraph('called after contents prepared but before command executed return true to execute, false to abort command');
        test.example('must be a function', undefined, function () {
        });
      });
      test.heading('validate', function () {
        test.paragraph('called to verify no errors');
      });
      test.heading('afterExecute', function () {
        test.paragraph('called after command is executed and about to terminate');
      });
      test.heading('stepTimeout', function () {
        test.paragraph('will use system setting as default, override to set the default timeout for steps used in procedures');
      });
    });
    test.heading('TYPES', function () {
      test.heading('Menu - contents is array of other commands for presentation', function () {
      });
      test.heading('Presentation', function () {
      });
      test.heading('Function', function () {
        test.paragraph('contents contains a javascript function');
      });
      test.heading('Procedure', function () {
        test.paragraph('Contents array of objects containing commands for execution.  Each array element is a "step" (object) with the following properties:');
        test.xexample('contents.label - optional label for this step of procedure', undefined, function () {
        });
        test.xexample('contents.dependencies - array of strings (or single string) corresponding to labels for the step(label) that must be resolved first', undefined, function () {
        });
        test.xexample('contents.started - set to true when step is started', undefined, function () {
        });
        test.xexample('contents.complete - set to true when the step is complete', undefined, function () {
        });
        test.xexample('contents.result - bucket to put any results', undefined, function () {
        });
        test.xexample('contents.timeout - maximum time given for task in ms - it not defined then value of maxTimeout', undefined, function () {
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('execute', function () {
        test.paragraph('executes task');
      });
      test.heading('abort', function () {
        test.paragraph('aborts task (override as needed)');
      });
    });
  });
};
