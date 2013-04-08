/**
 * tequila
 * model-test
 */

test.runnerModel = function () {
  test.heading('Model Class', function () {
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('Creation of all Models must adhere to following examples:');
      test.example('objects created should be an instance of Model', true, function () {
        return new Model() instanceof Model;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Model();
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('tags');
      test.example('tags');
      test.heading('attributes', function () {
        test.paragraph('the attributes property is an array of Attributes');
        test.example('should be an array', true, function () {
          var goodModel = new Model(), badModel = new Model();
          badModel.attributes = 'killer';
          test.show(goodModel.getValidationErrors());
          test.show(badModel.getValidationErrors());
          return (goodModel.getValidationErrors().length == 0 && badModel.getValidationErrors().length == 1);
        });

        test.xexample('elements of array must be instance of Attribute', true, function () {
          var model = new Model();
          model.attributes = [new Attribute("ID","ID"), new Model(), 0, 'a', {}, [], null];
          test.show(model.getValidationErrors());
          return (model.getValidationErrors() == model.attributes.length-1);
        });

      });
    });
    test.heading('METHODS', function () {
    });
  });

  /*
   describe('Properties', function () {
   describe('attributes', function () {

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
