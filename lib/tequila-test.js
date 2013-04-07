/**
 * tequila
 * tequila-test
 */
test.runnerTequila = function () {
  test.heading('Tequila() Singleton', function () {
    test.paragraph('The Tequila() manages the state of the library as a whole.');
    test.example('multiple instances are deep equal', true, function () {
      return (Tequila() === Tequila() && Tequila() === new Tequila());
    });
    test.heading('getVersion()');
    test.paragraph('This method returns the tequila library version.');
    test.example('tequila library version', '0.0.1', function () {
      return (Tequila().getVersion());
    });
    test.heading('contains(array,object)');
    test.paragraph('This method returns true or false as to whether object is contained in array.');
    test.example('object exists in array', true, function () {
      return Tequila().contains(['moe', 'larry', 'curley'], 'larry');
    });
    test.example('object does not exist in array', false, function () {
      return Tequila().contains(['moe', 'larry', 'curley'], 'shemp');
    });
    test.heading('getUnusedProperties(settings,allowedProperties)');
    test.paragraph('This method is used to check parameter properties as being valid.  If invoked with unknown property it throws an error.');
    test.example('valid property','occupation', function () {
      // got occupation and value backwards so occupation is an unknown property
      return Tequila().getUnusedProperties({name: 'name', occupation: 'value'}, ['name', 'value'])[0];
    });
    test.example('invalid property',0, function () {
      // no unknown properties
      return Tequila().getUnusedProperties({name: 'name', value: 'occupation'}, ['name', 'value']).length;
    });
    test.heading('inheritPrototype(p)');
    test.paragraph('This method returns a object that inherits properties from the prototype object p');
    test.example('Needed ?');
  });
}