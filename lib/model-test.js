/**
 * tequila
 * model-test
 */
test.runnerModel = function() {
  test.heading('Constructor',function() {
    test.paragraph('Creation of all Models must adhere to following examples:');
    test.example('true', undefined, function () {
    });
  });
  test.heading('Properties',function() {
  });
  test.heading('Methods',function() {
  });
/*
  describe('New instances of Model', function () {
    it('objects created should be an instance of Model', function () {
      new testModel().should.be.an.instanceOf(Model);
    });
    it('should make sure new operator used', function () {
      (function () {
        testModel();
      }).should.throw('new operator required');
    });
  });
  describe('Properties', function () {
    describe('tags', function () {
      xit('', function () {
        //
      });
    });
    describe('attributes', function () {
      it('should be an array or null', function () {
        var model = new testModel();
        model.attributes.should.be.instanceof(Array);
        model.attributes = 'wtf';
        model.getValidationErrors().length.should.equal(1);
      });
      it('elements of array must be instance of Attribute', function () {
        var model = new Model();
        model.attributes = [new Attribute("ID","ID"), new Model(), 0, 'a', {}, [], null];
        model.getValidationErrors().length.should.equal(model.attributes.length-1);
      });
      it('unless attribute is null, the first element should be an ID type Attribute', function () {
        var model = new Model();
        model.attributes = [new Attribute("name")];
        model.getValidationErrors().length.should.equal(1);
      });

    });
  });
  describe('Methods', function () {
    it('toString() return system description of the ' + modelName, function () {
      if (modelName == 'Model') // base class
        new testModel().toString().should.equal('a Model');
      else
        new testModel().toString().should.not.equal('a Model');
    });
    it('getName() returns the name of the ' + modelName, function () {
      if (modelName == 'Model') // base class
        new testModel().getName().should.equal('(unknown Model)');
      else {
        new testModel().getName().should.be.a('string').and.length.of.at.least(1);
      }
    });
    it('getSearchString() returns the primary search string for the ' + modelName, function () {
      var myModel = new testModel();
      // default returns same as getName() unless overriden by setSearchString();
      myModel.getName().should.be.equal(myModel.getSearchString());
    });
    it('setSearchString() sets the search description of the ' + modelName, function () {
      var myModel = new testModel();
      // override search string
      myModel.setSearchString('Little Pauly');
      myModel.getName().should.not.be.equal(myModel.getSearchString());
      myModel.setSearchString(); // clear it to go back to default
      myModel.getName().should.be.equal(myModel.getSearchString());
    });
    describe('getValidationErrors()', function () {
      it('should return array of validation errors', function () {
        new testModel().getValidationErrors().should.be.instanceof(Array);
      });
    });
    xit('storePut()', function () {
    });
    xit('storeGet()', function () {
    });
  });
*/
}
