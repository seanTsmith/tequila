/**
 * tequila
 * attribute-test
 */
test.runnerAttribute = function () {
  test.heading('Attribute Class()', function () {
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Attribute', true, function () {
        return new Attribute({name: 'aMust'}) instanceof Attribute;
      });
      test.example('should make sure properties are valid', Error('error creating Attribute: invalid property: sex'), function () {
        new Attribute({name: 'name', sex: 'female'});
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Attribute({name: 'Name'});
      });
      test.example('should validate and throw errors before returning from function', Error('error creating Attribute: multiple errors'), function () {
        new Attribute({eman: 'the'}); // 2 errors: name missing and eman an unknown property
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
      test.heading('value', function () {
        test.example('should accept null assignment', undefined, function () {
          // TODO move myTypes to T.getAttributeTypes
          var myTypes = ['String', 'Date', 'Boolean', 'Number', 'Group'];
          var record = '';
          for (var i in myTypes) {
            record += myTypes[i] + ':' + new Attribute({name: 'my' + myTypes[i]}).value + ' ';
          }
          test.show(record);
          // It's the default and it passes constructor validation
        });
        test.example('should accept assignment of correct type and validate incorrect attributeTypes', undefined, function () {
          // TODO move myTypes to T.getAttributeTypes
          var myTypes = ['String', 'Date', 'Boolean', 'Number', 'Group'];
          var myValues = ['Jane Doe', new Date, true, 18, [new Attribute('likes'), new Attribute('dislikes')]];
          for (var i in myTypes)
            for (var j in myValues) {
              if (i == j) {
                // matches good so no errors thrown
                new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j] });
              } else {
                // mismatches bad so should throw error (is caught unless no error or different error)
                test.shouldThrow(Error('error creating Attribute: value must be null or a ' + myTypes[i]), function () {
                  new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                });
              }
              // other objects should throw always
              test.shouldThrow(Error('error creating Attribute: value must be null or a ' + myTypes[i]), function () {
                new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: {} });
              });
            }
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
        test.paragraph('Parameter type Model is used to store a reference to another model of any type.');
        test.example("should be type of 'Model' or null", 'Model', function () {
          return new Attribute({name: 'Twiggy', type: 'Model', modelType: new Model()}).type;
        });
        test.example('modelType is required', Error('error creating Attribute: modelType must be instance of Model'), function () {
          return new Attribute({name: 'Twiggy', type: 'Model'});
        });
      });
      test.heading('Group', function () {
        test.example("should have type of 'Group'", 'Group',function () {
          return new Attribute({name: 'stuff', type: 'Group'}).type;
        });
        test.example('deep check value for valid Attributes that pass getValidationErrors() test', 1, function () {
          // this example is just to conventionalize nested components
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
          badApple.value = -1; // One bad apple will spoil my stuff
          test.show(myStuff.getValidationErrors());
          return myStuff.getValidationErrors().length;
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the attribute', 'Attribute: name', function () {
          return new Attribute({name: 'name'}).toString();
        });
      });
      test.heading('getValidationErrors()', function () {
        test.example('should return array of validation errors', undefined, function () {
          test.assertion(new Attribute({name: 'name'}).getValidationErrors() instanceof Array);
          var nameHosed = new Attribute({name: 'name'}); // No errors
          test.assertion(nameHosed.getValidationErrors().length == 0);
          nameHosed.name = ''; // 1 err
          test.assertion(nameHosed.getValidationErrors().length == 1);
          nameHosed.type = ''; // 2 errors
          test.assertion(nameHosed.getValidationErrors().length == 2);
        });
      });
    });
  });
};

