/**
 * tequila
 * command-test
 */
test.runnerCommand = function () {
  test.heading('Command Class', function () {
    test.paragraph('The command design pattern is implemented with this class.  The actual execution of the command' +
      'can be one of multiple types.');
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
      test.example('defaults name to (unnamed)', '(unnamed)', function () {
        return new Command().name;
      });
      test.example('defaults type to Stub', 'Stub', function () {
        return new Command({name: 'about'}).type;
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('name', function () {
        test.example('identifier name for command', 'about', function () {
          test.shouldThrow(Error('name must be string'), function () {
            new Command({name: 42});
          });
          return new Command({name: 'about'}).name;
        });
      });
      test.heading('description', function () {
        test.example('more descriptive than name (for menus)', 'Tequila is a beverage made from blue agave', function () {
          // description set to name if not specified
          var desc = new Command({name: 'Tequila'}).description;
          desc += ' is a ';
          desc += new Command({name: 'Tequila', description: 'beverage made from blue agave'}).description;
          return desc;
        });
      });
      test.heading('type', function () {
        test.example('type of command must be valid', Error('Invalid command type: magic'), function () {
          test.show(T.getCommandTypes());
          new Command({name: 'about', type: 'magic' });
        });
      });
      test.heading('contents', function () {
        test.paragraph('Contents is based on the type of command.  See TYPE section for more info');
      });
      test.heading('scope', function () {
        test.paragraph('Optional scope property can be used to apply a model or list to a command.');
        test.example('scope must be a Model or a List', Error('optional scope property must be Model or List'), function () {
          new Command({name: 'archiveData', scope: true});
        });
      });
      test.heading('executionErrors', function () {
        test.paragraph('Any truthy value considered an error, this value is considered valid when afterExecute is ' +
          'invoked to determine success of command.  See integration tests for more info.');
      });
      test.heading('beforeExecute', function () {
        test.paragraph('Callback will be invoked when this command is executed but before actually invoking command.  ' +
          'Callback can do any prep work and call abort before returning to cancel command from actually running ' +
          '_if desired_.');
        test.example('function required', Error('beforeExecute must be a Function'), function () {
          new Command({name: 'options', beforeExecute: 0});
        });
      });
      test.heading('afterExecute', function () {
        test.paragraph('Called after command is executed and about to terminate.');
        test.example('function required', Error('afterExecute must be a Function'), function () {
          new Command({name: 'options', afterExecute: 0});
        });
      });
      test.heading('stepTimeout', function () {
        test.paragraph('Will use system setting as default, override to set the default timeoutfor steps used in ' +
          'procedures. Value is milliseconds (1000 = 1 second)');
        test.example('number required', Error('stepTimeout must be a Number'), function () {
          new Command({name: 'options', stepTimeout: true});
        });
      });
    });
    test.heading('TYPES', function () {
      test.heading('Menu - contents is array of other commands for presentation', function () {
        test.example('for menu contents is an array of commands', undefined, function () {
          test.shouldThrow(Error('contents must be array of menu items'), function () {
            new Command({name: 'options', type: 'Menu'});
          });
          test.shouldThrow(Error('contents must be array of menu items'), function () {
            new Command({name: 'options', type: 'Menu', contents: []});
          });
          test.shouldThrow(Error('contents must be array of menu items'), function () {
            new Command({name: 'options', type: 'Menu', contents: [42]});
          });
          // This is a working example:
          new Command({name: 'options', type: 'Menu', contents: [
            'Stooges',                      // strings act as menu titles or non selectable choices
            '-',                            // dash is menu separator
            new Command({name: 'Tequila'})  // use commands for actual menu items
          ]});
        });
      });
      test.heading('Presentation', function () {
        test.example('for Presentation type contents is a Presentation object', undefined, function () {
          test.shouldThrow(Error('contents must be a Presentation'), function () {
            new Command({name: 'options', type: 'Presentation'});
          });
        });
      });
      test.heading('Function', function () {
        test.paragraph('contents contains a javascript function');
        test.example('for Function type contents is a Function', undefined, function () {
          test.shouldThrow(Error('contents must be a Function'), function () {
            new Command({name: 'options', type: 'Function'});
          });
        });
      });
      test.heading('Procedure', function () {
        test.paragraph('Contents array of objects containing commands for execution.  Each array element is a "step" (object) with the following properties:');
        test.example('for Procedure type contents array of objects for steps of procedure', undefined, function () {
          // must be array
          test.shouldThrow(Error('contents must be array of steps for procedure'), function () {
            new Command({name: 'archiveData', type: 'Procedure'});
          });
          // type is checked
          test.shouldThrow(Error('contents must be array of steps for procedure'), function () {
            new Command({name: 'archiveData', type: 'Procedure', contents: true});
          });
          // see valid properties in next examples - they are checked
          test.shouldThrow(Error('contents[0] has invalid property: sex'), function () {
            new Command({name: 'archiveData', type: 'Procedure', contents: [
              {sex: 'Bob-omb'}
            ]});
          });
          // command property is required
          test.shouldThrow(Error('contents[0] must have valid command property set to Command'), function () {
            new Command({name: 'archiveData', type: 'Procedure', contents: [
              {}
            ]});
          });
        });
        test.example('contents.label - optional label for this step of procedure', "Sex Bob-omb", function () {
          var task = new Command({name: 'Bob'});
          var job = new Command({name: 'Sex', type: 'Procedure', contents: [
            {label: 'omb', command: task}
          ]});
          return job.name + ' ' + task.name + '-' + job.contents[0].label;
        });
        test.example('contents.command - command to execute for this step', undefined, function () {
          new Command({name: 'archiveData', type: 'Procedure', contents: [
            {command: new Command({})}
          ]});
        });
        test.example('contents.requires - array of or single element of type string(label) number(array index) that ' +
          'must complete before executing this step. Use -1 for previous step, null for no dependencies', undefined, function () {
          test.shouldThrow(Error('required label getstuff not found in procedure'), function () {
            new Command({name: 'archiveData', type: 'Procedure', contents: [
              {command: new Command({}), requires: 'getstuff'}
            ]});
          });
        });
        test.xexample('contents.started - set to true when step is started', undefined, function () {
        });
        test.xexample('contents.completed - set to true when the step is complete', undefined, function () {
        });
        test.xexample('contents.results - bucket to put any results', undefined, function () {
        });
        test.xexample('contents.timeout - maximum time given for task in ms - it not defined then value of maxTimeout', undefined, function () {
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString', function () {
        test.example('returns string including name and type', 'I am a Stub Command: Customer', function () {
          return 'I am a ' + new Command({name: 'Customer'});
        });

      });
      test.heading('execute', function () {
        test.paragraph('executes task');
      });
      test.heading('abort', function () {
        test.paragraph('aborts task (override as needed)');
      });
    });
  });
};
