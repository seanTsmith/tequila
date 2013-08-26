/**
 * tequila
 * tequila-test
 */
test.runnerTequila = function () {
  test.heading('Tequila Singleton', function () {
    test.paragraph('The Tequila Singleton provides a namespace for the library.  In it is access to the classes ' +
      'that make up the library and a collection of helper methods.');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('The object is instantiated upon loading the source file.  Any call to Tequila() will return a ' +
        'reference to the singleton.');
      test.example('multiple instances are deep equal', true, function () {
        return (Tequila() === Tequila() && Tequila() === new Tequila());
      });
      test.example('A reference is available internally to all modules in the library "T"', true, function () {
        return T === Tequila();
      });
    });
    test.heading('METHODS', function () {
      test.heading('isServer()');
      test.paragraph('This method returns true running as server under node.');
      test.example('check against known invocation', true, function (test) {
        // When tests launch test.isBrowser is set - compare to library test for node
        return test.isBrowser != Tequila().isServer();
      });

      test.heading('contains(array,object)');
      test.paragraph('This method returns true or false as to whether object is contained in array.');
      test.example('object exists in array', true, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'larry');
      });
      test.example('object does not exist in array', false, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'shemp');
      });
      test.heading('getInvalidProperties(args,allowedProperties)');
      test.paragraph('Functions that take an object as it\'s parameter use this to validate the ' +
        'properties of the parameter by returning any invalid properties');
      test.example('valid property', 'Kahn', function () {
        // got Kahn and value backwards so Kahn is an unknown property
        return Tequila().getInvalidProperties({name: 'name', Kahn: 'value'}, ['name', 'value'])[0];
      });
      test.example('invalid property', 0, function () {
        // no unknown properties
        return Tequila().getInvalidProperties({name: 'name', value: 'Kahn'}, ['name', 'value']).length;
      });
      test.heading('getVersion()');
      test.paragraph('This method returns the tequila library version.');
      test.example('tequila library version', 2, function () {
        var libraryVersion = Tequila().getVersion();
        test.show(libraryVersion)
        return (libraryVersion.split(".").length - 1);
      });
      test.heading('inheritPrototype(p)');
      test.paragraph('This method returns a object that inherits properties from the prototype object p');
      test.example('new objects are instance of inherited object', undefined, function () {
        Thing = function (name) { // Create class and 2 subclasses
          this.name = name;
        };
        Car = function (name) {
          Thing.call(this, name); // apply Thing constructor
          this.canBeDriven = true;
        };
        Car.prototype = T.inheritPrototype(Thing.prototype); // <- proper usage
        Food = function (name) {
          Thing.call(this, name); // apply Thing constructor
          this.canBeEaten = true;
        };
        var thing = new Thing('rock'), car = new Car('mustang'), food = new Food('pizza');
        test.assertion(!thing.canBeDriven && car.canBeDriven && !food.canBeDriven);
        test.assertion(!thing.canBeEaten && !car.canBeEaten && food.canBeEaten);
        test.assertion(thing.name == 'rock' && car.name == 'mustang' && food.name == 'pizza');
        test.assertion(car instanceof Car && car instanceof Thing); // T.inheritPrototype makes this work
        test.assertion(food instanceof Food && !(food instanceof Thing)); // without calling T.inheritPrototype
      });
    });
  });
};