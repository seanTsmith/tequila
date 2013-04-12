/**
 * tequila
 * model-test
 */

test.runnerModel = function (SurrogateModelClass,inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('Model Class', function () {
    test.paragraph('Models being the primary purpose of this library are extensions of javascript objects.  ' +
      'The tequila class library provides this class to encapsulate and enforce consistant programming interface' +
      'to the models created by this library.');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('Creation of all Models must adhere to following examples:');
      test.example('objects created should be an instance of Model', true, function () {
        return new SurrogateModelClass() instanceof Model;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Model();
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('tags', function () {
        test.paragraph('Tags are an array of strings that can be used in searching.');
        test.example('should be an array or undefined', undefined, function () {
          var m = new SurrogateModelClass(); // default is undefined
          test.assertion(m.tag === undefined && m.getValidationErrors().length == 0);
          m.tags = [];
          test.assertion(m.getValidationErrors().length == 0);
          m.tags = 'your it';
          test.assertion(m.getValidationErrors().length == 1);
        });
      });
      test.heading('attributes', function () {
        test.paragraph('The attributes property is an array of Attributes.');
        test.example('should be an array', true, function () {
          var goodModel = new SurrogateModelClass(), badModel = new SurrogateModelClass();
          badModel.attributes = 'killer';
          test.show(goodModel.getValidationErrors());
          test.show(badModel.getValidationErrors());
          return (goodModel.getValidationErrors().length == 0 && badModel.getValidationErrors().length == 1);
        });
        test.example('elements of array must be instance of Attribute', undefined, function () {
          var model = new SurrogateModelClass();
          model.attributes = [new Attribute("ID","ID")];
          test.assertion(model.getValidationErrors().length==0);
          model.attributes = [new Attribute("ID","ID"), new SurrogateModelClass(), 0, 'a', {}, [], null];
          test.assertion(model.getValidationErrors().length==6);
        });
      });
    });
    test.heading('METHODS', function () {
    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
