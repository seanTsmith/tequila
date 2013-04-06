/**
 * tequila
 * tequila-test
 */
test.classLibrary = function (func) {
  test.heading('Tequila() Singleton', function (func) {
    test.paragraph('The Tequila() manages the state of the library as a whole.');
    test.example('multiple instances are deep equal', true, function () {
      return (Tequila() === Tequila() && Tequila() === new Tequila());
    });
    test.example('getVersion() should return ', '0.0.1', function () {
      return (Tequila().getVersion());
    });
    test.heading('contains(array,object)');
    test.paragraph('This method returns true or false as to whether object is contained in array.');
    test.example('tgi.contains(array,object) should check for existence of object in array', true, function () {
      return Tequila().contains(['moe', 'larry', 'curley'], 'larry');
    });
    test.example('tgi.contains(array,object) should check for existence of object in array', false, function () {
      return Tequila().contains(['moe', 'larry', 'curley'], 'shemp');
    });
  });
//  it('tgi.contains(array,object) should check for existence of object in array', function () {
//    tgi.contains(['moe', 'larry', 'curley'], 'larry').should.be.true;
//    tgi.contains(['moe', 'larry', 'curley'], 'shemp').should.be.false;
//  });
//  it('tgi.getUnusedProperties(settings,allowedProperties) should ensure all properties in settings are contained in allowedProperties', function () {
//    // got occupation and value backwards so occupation is an unknown property
//    tgi.getUnusedProperties({name: 'name', occupation: 'value'}, ['name', 'value'])[0].should.equal('occupation');
//    // no unknown properties
//    tgi.getUnusedProperties({name: 'name', value: 'occupation'}, ['name', 'value']).length.should.equal(0);
//  });
//  it('tgi.inheritPrototype(p) should return a object that inherits properties from the prototype object p', function () {
//    // for docs, tests covered in Model Usage
//  });
//  xit('tgi.isModel(m) should return true if m is a Model', function () {
////          tgi.isModel(1)
//  });


}