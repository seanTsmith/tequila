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
          var myTypes = T.getAttributeTypes();
          var record = '';
          for (var i in myTypes) {
            record += myTypes[i] + ':' + new Attribute({name: 'my' + myTypes[i]}).value + ' ';
          }
          test.show(record);
          // It's the default and it passes constructor validation
        });
        test.example('should accept assignment of correct type and validate incorrect attributeTypes', undefined, function () {
          // Test all known attribute types (TODO ID type needs work)
          var myTypes = T.getAttributeTypes();
          test.show(myTypes);

          // Now create an array of matching values for each type into myValues
          var myModel = new Model();
          var myGroup = new Attribute({name: 'columns', type: 'Group', value: [new Attribute("Name")]});
          var myTable = new Attribute({name: 'bills', type: 'Table', group: myGroup });
          var myValues = [null, 'Jane Doe', new Date, true, 18, new Model(), [], myTable];

          // Loop thru each type
          for (var i in myTypes)
            for (var j in myValues) {
              // for the value that works it won't throw error just create and to test
              if (i == j) {
                switch (myTypes[i]) {
                  case 'Model':
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j], modelType: myModel});
                    break;
                  case 'Group':
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                    break;
                  case 'Table':
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j], group: myGroup});
                    break;
                  default:
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j] });
                    break;
                }
              } else {
                // mismatches bad so should throw error (is caught unless no error or different error)
                if (j > 0) { // null in id will be valid for others so skip
                  test.shouldThrow('*', function () {
                    new Attribute({name: 'my' + myTypes[i], type: myTypes[i], value: myValues[j]});
                  });
                }
              }
              // other objects should throw always
              test.shouldThrow('*', function () {
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
        test.paragraph('Parameter type Model is used to store a reference to another model of any type.  The value attribute is the ID of the referenced Model.');
        test.example("should be type of 'Model' or null", 'Model', function () {
          return new Attribute({name: 'Twiggy', type: 'Model', modelType: new Model()}).type;
        });
        test.example('modelType is required', Error('error creating Attribute: modelType must be instance of Model'), function () {
          return new Attribute({name: 'Twiggy', type: 'Model'});
        });
      });
      test.heading('Group', function () {
        test.paragraph('Groups are used to keep attributes together for presentation purposes.');
        test.example("should have type of 'Group'", 'Group', function () {
          return new Attribute({name: 'stuff', type: 'Group'}).type;
        });
        test.example('deep check value for valid Attributes that pass getValidationErrors() test', 1, function () {
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
          test.show(myStuff.getValidationErrors());
          badApple.value = -1; // One bad apple will spoil my stuff
          test.show(myStuff.getValidationErrors());
          return myStuff.getValidationErrors().length;
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
            new Attribute({name: 'bills', type: 'Table'});
          });
        test.example("group property must not be empty array",
          Error('error creating Attribute: group property value must contain at least one Attribute'), function () {
            var cols = new Attribute({name: 'columns', type: 'Group', value: []});
            new Attribute({name: 'bills', type: 'Table', group: cols });
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
            new Attribute({name: 'Twiggy', type: 'Model', modelType: new Model()}).coerce();
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute(myGroup.coerce());
          });
          test.shouldThrow(Error('coerce cannot determine appropriate value'), function () {
            new Attribute(myTable.coerce());
          });
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