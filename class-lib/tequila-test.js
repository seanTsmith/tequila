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
      test.heading('contains(array,object)');
      test.paragraph('This method returns true or false as to whether object is contained in array.');
      test.example('object exists in array', true, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'larry');
      });
      test.example('object does not exist in array', false, function () {
        return Tequila().contains(['moe', 'larry', 'curley'], 'shemp');
      });
      test.heading('getRegisteredStores');
      test.paragraph('This method returns an array of registered stores.');
      test.example('must be an array', '[object Array]', function () {
        return Object.prototype.toString.call( Tequila().getRegisteredStores() );
      });
      test.heading('getUnusedProperties(settings,allowedProperties)');
      test.paragraph('This method is used to check parameter properties as being valid.  If invoked with unknown property it throws an error.');
      test.example('valid property', 'occupation', function () {
        // got occupation and value backwards so occupation is an unknown property
        return Tequila().getUnusedProperties({name: 'name', occupation: 'value'}, ['name', 'value'])[0];
      });
      test.example('invalid property', 0, function () {
        // no unknown properties
        return Tequila().getUnusedProperties({name: 'name', value: 'occupation'}, ['name', 'value']).length;
      });
      test.heading('getVersion()');
      test.paragraph('This method returns the tequila library version.');
      test.example('tequila library version', '0.0.1', function () {
        return (Tequila().getVersion());
      });
      test.heading('inheritPrototype(p)');
      test.paragraph('This method returns a object that inherits properties from the prototype object p');
      test.example('new objects are instance of inherited object', undefined, function () {
        Thing = function (name) { // Create class and 2 subclasses
          this.name = name;
        };
        Car = function (name) {
          Thing.call(this,name); // apply Thing constructor
          this.canBeDriven = true;
        };
        Car.prototype = T.inheritPrototype(Thing.prototype); // <- proper usage
        Food = function (name) {
          Thing.call(this,name); // apply Thing constructor
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