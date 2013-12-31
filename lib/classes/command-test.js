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
        test.example('more descriptive than name (for menus)', 'Tequila Command : Tequila is a beverage made from blue agave.', function () {
          // description set to (name) Command if not specified
          return new Command({name: 'Tequila'}).description + ' : ' +
            new Command({name: 'tequila', description: 'Tequila is a beverage made from blue agave.'}).description;
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
      test.heading('status', function () {
        test.paragraph('The status property is a Number defined as negative(FAIL) positive(SUCCESS) zero(executing) ' +
          'null/undefined(not executing).');
        test.paragraph('Applications can give meaning to numeric values (lt -1 and gt 1) as long as sign is retained.');
      });
      test.heading('timeout', function () {
        test.paragraph('Will use library setting as default, override to set the default timeout for steps used in ' +
          'procedures. Value is milliseconds (1000 = 1 second)');
        test.example('number required', Error('timeout must be a Number'), function () {
          new Command({name: 'options', timeout: true});
        });
      });
      test.heading('theme', function () {
        test.example('theme attribute provides visual cue', undefined, function () {
          // The good
          new Command({name: 'options', theme: 'default'});
          new Command({name: 'options', theme: 'primary'});
          new Command({name: 'options', theme: 'success'});
          new Command({name: 'options', theme: 'info'});
          new Command({name: 'options', theme: 'warning'});
          new Command({name: 'options', theme: 'danger'});
          new Command({name: 'options', theme: 'link'});
          // The bad
          test.shouldThrow(Error('invalid theme'), function () {
            new Command({name: 'options', theme: 'Silly'});
          });
          // The ugly
          test.shouldThrow(Error('invalid theme'), function () {
            new Command({name: 'options', theme: true});
          });
        });

      });
      test.heading('icon', function () {
        test.paragraph('The icon attribute gives a graphical association to the command.' +
          ' They are interface specific and do break the abstractness of this library but can be ignored by' +
          ' other interfaces safely.');
        test.example('must be string and have prefix for 2 supported icon sets ' +
          'http://glyphicons.com/ http://fontawesome.io/', undefined, function () {

          test.shouldThrow(Error('invalid icon'), function () {
            new Command({name: 'options', icon: true});
          });
          test.shouldThrow(Error('invalid icon'), function () {
            new Command({name: 'options', icon: 'wtf-lol'});
          });
          // Only prefix is validated
          new Command({name: 'options', icon: 'fa-whatever'});
          new Command({name: 'options', icon: 'glyphicon-who-cares'});
          // Must have something to the right of the dash
          test.shouldThrow(Error('invalid icon'), function () {
            new Command({name: 'options', icon: 'fa'});
          });
        });
      });

      test.heading('bucket', function () {
        test.example('valid property is for app use', 'bucket of KFC', function () {
          return 'bucket of ' + new Command({bucket: 'KFC'}).bucket;
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
      test.heading('abort', function () {
        test.paragraph('aborts task');
        test.example('aborted command ends with error status', -1, function () {
          var cmd = new Command();
          cmd.abort();
          return cmd.status;
        });
      });
      test.heading('complete', function () {
        test.paragraph('completes task');
        test.example('call when task complete status', 1, function () {
          var cmd = new Command();
          cmd.complete();
          return cmd.status;
        });
      });
      test.heading('execute', function () {
        test.paragraph('executes task');
        test.example('see integration tests', Error('command type Stub not implemented'), function () {
          new Command().execute();
        });
      });
      test.heading('onEvent', function () {
        test.paragraph('Use onEvent(events,callback)');
        test.example('first parameter is a string or array of event subscriptions', Error('subscription string or array required'), function () {
          new Command().onEvent();
        });
        test.example('callback is required', Error('callback is required'), function () {
          new Command().onEvent([]);
        });
        test.example('events are checked against known types', Error('Unknown command event: onDrunk'), function () {
          new Command().onEvent(['onDrunk'], function () {
          });
        });
        test.example('here is a working version', undefined, function () {
          test.show(T.getCommandEvents());
          //  BeforeExecute - callback called before first task executed but after tasks initialized
          //  AfterExecute - callback called after initial task(s) launched (see onCompletion)
          //  Error - error occurred (return {errorClear:true})
          //  Aborted - procedure aborted - should clean up resources
          //  Completed - execution is complete check status property
          new Command().onEvent(['Completed'], function () {
          });
        });
      });
    });
  });
};
