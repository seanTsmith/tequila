/**
 * tequila
 * attribute-test
 */
test.runnerAttribute = function () {
  test.heading('Attribute Class', function () {
    test.paragraph('Attributes are the means for models to represent data of different types.  They have no' +
      ' dependencies on Models however and can be used without creating a model.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Attribute', true, function () {
        return new Attribute({name: 'name'}) instanceof Attribute;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Attribute({name: 'name'});
      });
      test.example('should make sure properties are valid', Error('error creating Attribute: invalid property: sex'), function () {
        new Attribute({name: 'name', sex: 'female'});
      });
      test.example('should validate and throw errors before returning from constructor', Error('error creating Attribute: multiple errors'), function () {
        new Attribute({eman: 'the'}); // 2 errors: name missing and eman an unknown property
      });
      test.heading('Attribute.ModelID', function () {
        test.paragraph('Attribute.ModelID defines reference to ID in external model.');
        test.example('objects created should be an instance of Attribute.ModelID', true, function () {
          return new Attribute.ModelID(new Model()) instanceof Attribute.ModelID;
        });
        test.example('should make sure new operator used', Error('new operator required'), function () {
          Attribute.ModelID();
        });
        test.example('constructor must pass instance of model', Error('must be constructed with Model'), function () {
          new Attribute.ModelID();
        });
        test.example('value is set to value of ID in constructor', 123, function () {
          var model = new Model();
          model.set('id', 123);
          return new Attribute.ModelID(model).value;
        });
        test.example('constructorFunction is set to constructor of model', true, function () {
          var model = new Model();
          model.set('id', 123);
          var attrib = new Attribute.ModelID(model);
          var newModel = new attrib.constructorFunction();
          return newModel instanceof Model;
        });
        test.example('modelType is set from model in constructor', 'Model', function () {
          return new Attribute.ModelID(new Model()).modelType;
        });
        test.example('toString is more descriptive', "ModelID(Model:123)", function () {
          var model = new Model();
          model.set('id', 123);
          return new Attribute.ModelID(model).toString();
        });
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('name', function () {
        test.example('should be required', Error('error creating Attribute: name required'), function () {
          new Attribute();
        });
        test.example('should allow shorthand string constructor for name property', 'Attribute: favoriteActorName', function () {
          return new Attribute('favoriteActorName');
        });
      });
      test.heading('type', function () {
        test.example("should default to 'String'", 'String', function () {
          return new Attribute({name: 'name'}).type;
        });
        test.example('should be a valid attribute type', Error('error creating Attribute: Invalid type: Dude'), function () {
          test.show(T.getAttributeTypes());
          new Attribute({name: 'Bogus', type: "Dude"});
        });
        test.example('should allow shorthand string constructor for type property', 'Date', function () {
          return new Attribute('favoriteActorBorn', 'Date').type;
        });
      });
      test.heading('label', function () {
        test.example('should default to name property', 'name', function () {
          return new Attribute({name: 'name'}).label;
        });
        test.example('should be optional in constructor', 'Name', function () {
          return new Attribute({name: 'name', label: 'Name'}).label;
        });
      });
      test.heading('placeHolder', function () {
        test.example('pass thru to Interface used as visual cue to user for input', '###-##-####', function () {
          return new Attribute({name: 'ssn', placeHolder: '###-##-####'}).placeHolder;
        });
      });
      test.heading('quickPick', function () {
        test.example('list of values to pick from typicaly invoked from dropdown', 3, function () {
          return new Attribute({name: 'stooge', quickPick: ['moe', 'larry', 'curly']}).quickPick.length;
        });
      });
      test.heading('validationErrors', function () {
        test.example('Array of errors', undefined, function () {
          test.assertion(new Attribute({name: 'name'}).validationErrors instanceof Array);
          test.assertion(new Attribute({name: 'name'}).validationErrors.length == 0);
        });
      });
      test.heading('validationMessage', function () {
        test.example('string description of error(s)', '', function () {
          return new Attribute({name: 'name'}).validationMessage;
        });
      });
      test.heading('value', function () {
        test.example('should accept null assignment', undefined, function () {
          var myTypes = T.getAttributeTypes();
          var record = '';
          for (var i in myTypes) {
            record += myTypes[i] + ':' + new Attribute({name: 'my' + myTypes[i]}).value + ' ';
          }
          test.show(record);
          // It's the default and it passes constructor validation
        });
        test.example('should accept assignment of correct type and validate incorrect attributeTypes',
          '7 correct assignments 91 errors thrown', function () {
            // Test all known attribute types
            var myTypes = T.getAttributeTypes();
            myTypes.shift(); // not testing ID
            myTypes.pop(); // not testing Object since it matches other types
            test.show(myTypes);
            test.show(T.getAttributeTypes());

            // Now create an array of matching values for each type into myValues
            var myModel = new Model();
            var myGroup = new Attribute({name: 'columns', type: 'Group', value: [new Attribute("Name")]});
            var myTable = new Attribute({name: 'bills', type: 'Table', group: myGroup });
            var myValues = ['Jane Doe', new Date, true, 18, new Attribute.ModelID(new Model()), [], myTable];

            // Loop thru each type
            var theGood = 0;
            var theBad = 0;
            for (var i = 0; i < myTypes.length; i++)
              for (var j = 0; j < myValues.length; j++) {
                // for the value that works it won't throw error just create and to test
                if (i == j) {
                  theGood++;
                  switch (myTypes[i]) {
                    case 'Table':
                      new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j], group: myGroup});
                      break;
                    default:
                      new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j] });
                      break;
                  }
                } else {
                  // mismatches bad so should throw error (is caught unless no error or different error)
                  theBad++;
                  test.shouldThrow('*', function () {
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                  });
                }
                // other objects should throw always
                theBad++;
                test.shouldThrow('*', function () {
                  new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: {} });
                });
              }
            return theGood + ' correct assignments ' + theBad + ' errors thrown';
          });
      });
    });
    test.heading('TYPES', function () {
      test.heading('ID', function () {
        test.example("should have type of 'ID'", 'ID', function () {
          return new Attribute({name: 'CustomerID', type: 'ID'}).type;
        });
      });
      test.heading('String', function () {
        test.example("should have type of 'String'", 'String', function () {
          return new Attribute({name: 'Cheese', type: 'String'}).type;
        });
        test.example('should have size property', 10, function () {
          // Note: size property is not "enforced" but for formatting purposes
          return new Attribute({name: 'zipCode', size: 10}).size;
        });
        test.example('size should default to 50', 50, function () {
          return new Attribute({name: 'stuff'}).size;
        });
        test.example('size should be an integer', 'Error: error creating Attribute: size must be a number from 1 to 255', function () {
          new Attribute({name: 'zipCode', size: "10"});
        });
        test.example('size should be between 1 and 255', undefined, function () {
          test.shouldThrow(Error('error creating Attribute: size must be a number from 1 to 255'), function () {
            new Attribute({name: 'partyLikeIts', size: 1999});
          });
          test.shouldThrow(Error('error creating Attribute: size must be a number from 1 to 255'), function () {
            new Attribute({name: 'iGotNothing', size: 0});
          });
        });
        test.example('size should accept format shorthand with parens', 255, function () {
          return new Attribute({name: 'comments', type: 'String(255)'}).size;
        });
      });
      test.heading('Number', function () {
        test.example("type should be 'Number'", 'Number', function () {
          return new Attribute({name: 'healthPoints', type: 'Number'}).type;
        });
      });
      test.heading('Date', function () {
        test.example("type should be 'Date'", 'Date', function () {
          return new Attribute({name: 'born', type: 'Date'}).type;
        });
      });
      test.heading('Boolean', function () {
        test.example("type should be 'Boolean'", 'Boolean', function () {
          return new Attribute({name: 'bored', type: 'Boolean'}).type;
        });
      });
      test.heading('Model', function () {
        test.paragraph('Parameter type Model is used to store a reference to another model instance.  ' +
          'The value attribute is a Attribute.ModelID reference to the Model.');

        test.example('must construct with Attribute.ModelID in value', Error('error creating Attribute: value must be Attribute.ModelID'), function () {
          new Attribute({name: 'Twiggy', type: 'Model'});
        });
        test.example("modelType property set from constructor", 'Model', function () {
          return new Attribute(
            {name: 'Twiggy',
              type: 'Model',
              value: new Attribute.ModelID(new Model())
            }).modelType;
        });
      });
      test.heading('Group', function () {
        test.paragraph('Groups are used to keep attributes together for presentation purposes.');
        test.example("should have type of 'Group'", 'Group', function () {
          return new Attribute({name: 'stuff', type: 'Group'}).type;
        });
        test.example('deep check value for valid Attributes that pass getObjectStateErrors() test', 1, function () {
          // this example is just to conceptualize nested components
          var myStuff = new Attribute("stuff", "Group");
          var myCars = new Attribute("cars", "Group");
          var myFood = new Attribute("food", "Group");
          var myFruit = new Attribute("fruit", "Group");
          var myVegs = new Attribute("vegetables", "Group");
          var badApple = new Attribute('Apple');
          myCars.value = [new Attribute('Nova'), new Attribute('Pinto')];
          myFruit.value = [badApple, new Attribute('Peach')];
          myVegs.value = [new Attribute('Carrot'), new Attribute('Beet')];
          myFood.value = [myFruit, myVegs];
          myStuff.value = [myFood, myCars, new Attribute('House'), new Attribute('Health')];
          test.show(myStuff.getObjectStateErrors());
          badApple.value = -1; // One bad apple will spoil my stuff
          test.show(myStuff.getObjectStateErrors());
          return myStuff.getObjectStateErrors().length;
        });
      });
      test.heading('Table', function () {
        test.paragraph("Table types are used to store an array of values (rows) each of which is an array of " +
            "values (columns).  Each column value is associated with the corresponding element in the Table " +
            "property group which is set when creating a Table."
        );
        test.example("should have type of 'Table'", 'Table', function () {
          var name = new Attribute("Name");
          var cols = new Attribute({name: 'columns', type: 'Group', value: [name]});
          return new Attribute({name: 'bills', type: 'Table', group: cols }).type;
        });
        test.example("group property must be defined", Error('error creating Attribute: group property required'),
          function () {
            new Attribute({name: 'details', type: 'Table'});
          });
        test.example("group property must not be empty array",
          Error('error creating Attribute: group property value must contain at least one Attribute'), function () {
            var cols = new Attribute({name: 'columns', type: 'Group', value: []});
            new Attribute({name: 'details', type: 'Table', group: cols });
          });
      });
      test.heading('Object', function () {
        test.paragraph('Javascript objects ... structure user defined');
        test.example("should have type of 'Object'", 'Object', function () {
          return new Attribute({name: 'stuff', type: 'Object'}).type;
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the attribute', 'Attribute: name', function () {
          return new Attribute({name: 'name'}).toString();
        });
      });
      test.heading('coerce(newValue)', function () {
        test.paragraph('Method returns the type equivalent of newValue for the owner objects type.');
        test.example('coerce method basic usage', undefined, function () {
          var myString = new Attribute({name: 'name', size: 10});
          var myNumber = new Attribute({name: 'age', type: 'Number' });
          var myBool = new Attribute({name: 'active', type: 'Boolean' });
          var myGroup = new Attribute({name: 'columns', type: 'Group', value: [new Attribute("Name")]});
          var myTable = new Attribute({name: 'bills', type: 'Table', group: myGroup });
          test.show(myBool.coerce('12/31/99'));
          // Strings
          test.assertion(myString.coerce() === '');
          test.assertion(myString.coerce(false) === 'false');
          test.assertion(myString.coerce(12) === '12');
          test.assertion(myString.coerce(1 / 0) === 'Infinity');
          test.assertion(myString.coerce('01234567890') === '0123456789');
          test.assertion(myString.coerce() === '');
          // Numbers
          test.assertion(myNumber.coerce() === 0);
          test.assertion(myNumber.coerce(false) === 0);
          test.assertion(myNumber.coerce(true) === 1);
          test.assertion(myNumber.coerce(' 007 ') === 7);
          test.assertion(myNumber.coerce(' $123,456.78 ') === 123456.78);
          test.assertion(myNumber.coerce(' $123, 456.78 ') === 123); // space will split
          test.assertion(myNumber.coerce('4/20') === 0); // slash kills it
          // Boolean
          test.assertion(myBool.coerce() === false && myBool.coerce(null) === false && myBool.coerce(0) === false);
          test.assertion(myBool.coerce(true) === true && myBool.coerce(1) === true);
          test.assertion(myBool.coerce('y') && myBool.coerce('yEs') && myBool.coerce('t') && myBool.coerce('TRUE') && myBool.coerce('1'));
          test.assertion(!((myBool.coerce('') || (myBool.coerce('yep')))));
          // TODO
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute('TODO', 'Date').coerce();
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute({name: 'Twiggy', type: 'Model', value: new Attribute.ModelID(new Model())}).coerce();
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute(myGroup.coerce());
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute(myTable.coerce());
          });
        });
      });
      test.heading('getObjectStateErrors', function () {
        test.example('should return array of validation errors', undefined, function () {
          test.assertion(new Attribute({name: 'name'}).getObjectStateErrors() instanceof Array);
          var nameHosed = new Attribute({name: 'name'}); // No errors
          test.assertion(nameHosed.getObjectStateErrors().length == 0);
          nameHosed.name = ''; // 1 err
          test.assertion(nameHosed.getObjectStateErrors().length == 1);
          nameHosed.type = ''; // 2 errors
          test.assertion(nameHosed.getObjectStateErrors().length == 2);
        });
      });
      test.heading('onEvent', function () {
        test.paragraph('Use onEvent(events,callback)');
        test.example('first parameter is a string or array of event subscriptions', Error('subscription string or array required'), function () {
          new Attribute({name: 'name'}).onEvent();
        });
        test.example('callback is required', Error('callback is required'), function () {
          new Attribute({name: 'name'}).onEvent([]);
        });
        test.example('events are checked against known types', Error('Unknown command event: onDrunk'), function () {
          new Attribute({name: 'name'}).onEvent(['onDrunk'], function () {
          });
        });
        test.example('here is a working version', undefined, function () {
          test.show(T.getAttributeEvents());
          // Validate - callback when attribute needs to be validated
          // StateChange -- callback when state of object (value or validation state) has changed
          new Attribute({name: 'name'}).onEvent(['Validate'], function () {
          });
        });
      });
      test.heading('validate', function () {
        test.paragraph('check valid object state and value for attribute - invoke callback for results');
        test.example('callback is required', Error('callback is required'), function () {
          new Attribute({name: 'name'}).validate();
        });
      });
      test.heading('setError', function () {
        test.paragraph('Set a error condition and descriptive message');
        test.example('first argument condition required', Error('condition required'), function () {
          new Attribute({name: 'status'}).setError();
        });
        test.example('second argument description required', Error('description required'), function () {
          new Attribute({name: 'status'}).setError('login');
        });
      });
      test.heading('clearError', function () {
        test.paragraph('Clear a error condition');
        test.example('first argument condition required', Error('condition required'), function () {
          new Attribute({name: 'status'}).clearError();
        });
      });
    });
    test.heading('INTEGRATION', function () {
      test.example('validation usage demonstrated', test.asyncResponse('got milk'), function (testNode, returnResponse) {
        var attribute = new Attribute({name: 'test'});
        var testGoals = {};

        // Monitor state changes
        attribute.onEvent('StateChange', function () {
          console.log('validationMessage: ' + attribute.validationMessage);
          if (attribute.validationMessage == 'got milk')
            returnResponse(testNode, 'got milk');
        });

        // validate will first make sure the object passes integrity checks
        attribute.name = '';
        attribute.validate(test1);

        // verify error seen
        function test1() {
          test.assertion(attribute.validationMessage == 'name required');
          // Create a validation rule - value must be equal to 42
          attribute.onEvent('Validate', function () {
            if (attribute.value !== 42)
              attribute.validationErrors.push('Incorrect answer');
          });
          attribute.validate(test2);
        }

        // same error in message
        function test2() {
          test.assertion(attribute.validationMessage == 'name required');
          attribute.name = 'answer';
          attribute.validate(test3);
        }

        // Now validation function error is shown
        function test3() {
          test.assertion(attribute.validationMessage == 'Incorrect answer');

          // Fix everything
          attribute.value = 42;
          attribute.validate(test4);
        }

        // Type is wrong
        function test4() {
          test.assertion(attribute.validationMessage == 'value must be null or a String');
          // Fix type
          attribute.type = 'Number';
          attribute.validate(test5);
        }

        // Should have no errors
        function test5() {
          test.assertion(attribute.validationMessage == '');
          attribute.setError('uno', 'uno failed');
          attribute.setError('milk', 'and cookies');
          attribute.setError('milk', 'got milk'); // test overwrite of same condition diff msg
          attribute.validate(test6);
        }

        // now error is first set error
        function test6() {
          test.assertion(attribute.validationMessage == 'uno failed');
          attribute.clearError('zzz'); // delete a prop that does not exists is silent
          attribute.clearError('uno');
          attribute.validate(function () {
            //
          });
        }
      });
    });
  });
};
