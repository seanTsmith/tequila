/**
 * tequila
 * command-test
 */
test.runnerCommand = function () {
  test.heading('Command Class', function () {
    test.paragraph('The command design pattern is implemented with this class.  The actual execution of the command ' +
      'can be one of multiple types from simple code to a _Presentation Model_ applied to a _Interface_ implementation.');
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
        test.paragraph('Contents is based on the type of command.  See TYPE section for more information for how it ' +
          'applies to each type');
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
      test.heading('afterExecute', function () {
        test.paragraph('Called after command is executed and about to terminate.');
        test.example('function required', Error('afterExecute must be a Function'), function () {
          new Command({name: 'options', afterExecute: 0});
        });
      });
      test.heading('observe', function () {
        test.paragraph('Called when state of command changes. ' +
          'TODO: Need state representation enumerators... Encompass procedure to report progress especially');
        test.example('function required', Error('observe must be a Function'), function () {
          new Command({name: 'options', observe: 0});
        });
      });
    });
    test.heading('TYPES', function () {
      test.heading('menu', function () {
        test.paragraph('The menu command is passed to _Interface_ for use for in user navigation.  ' +
          'They are embedded in the _Application_ as the primary navigate but can be instantiated and given to ' +
          '_Interface_ in any context.');
        test.paragraph('The _Command_ contents property is an array _Command_ objects.');
        test.example('constructor validates the contents', undefined, function () {
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
        test.example('for Procedure type contents is a Procedure object', undefined, function () {
          test.shouldThrow(Error('contents must be a Procedure'), function () {
            new Command({name: 'options', type: 'Procedure'});
          });
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
