/**
 * tequila
 * model-test
 */

test.runnerModel = function (SurrogateModelClass, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('Model Class', function () {
    test.paragraph('Models being the primary purpose of this library are extensions of javascript objects.  ' +
      'The tequila class library provides this class to encapsulate and enforce consistent programming interface' +
      'to the models created by this library.');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('Creation of all Models must adhere to following examples:');
      test.example('objects created should be an instance of Model', true, function () {
        return new SurrogateModelClass() instanceof Model;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        SurrogateModelClass();
      });
      test.example('should make sure properties are valid', Error('error creating Attribute: invalid property: sup'), function () {
        new SurrogateModelClass({sup: 'yo'});
      });
      test.example('can supply attributes in constructor in addition to ID default', 'Attribute: id,Attribute: description', function () {
        return new SurrogateModelClass({attributes: [new Attribute('description')]}).attributes;
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
          badModel.attributes = 'wtf';
          return (goodModel.getValidationErrors().length == 0 && badModel.getValidationErrors().length == 1);
        });
        test.example('elements of array must be instance of Attribute', undefined, function () {
          var model = new SurrogateModelClass();
          model.attributes = [new Attribute("ID", "ID")];
          test.assertion(model.getValidationErrors().length == 0);
          model.attributes = [new Attribute("ID", "ID"), new SurrogateModelClass(), 0, 'a', {}, [], null];
          test.assertion(model.getValidationErrors().length == 6);
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the attribute', 'a ' + new SurrogateModelClass().modelType, function () {
          return new SurrogateModelClass().toString();
        });
      });
      test.heading('getValidationErrors()', function () {
        test.example('should return array of validation errors', undefined, function () {
          test.assertion(new SurrogateModelClass().getValidationErrors() instanceof Array);
        });
        test.example('first attribute must be an ID field', 'first attribute must be ID', function () {
          var m = new SurrogateModelClass();
          m.attributes = [new Attribute('spoon')];
          return m.getValidationErrors();
        });
      });
      test.heading('getAttributeValue(attributeName)', function () {
        test.example('returns undefined if the attribute does not exists', undefined, function () {
          return new SurrogateModelClass().getAttributeValue('whatever');
        });
        test.example("returns the value for given attribute", 42, function () {
          var question = new SurrogateModelClass({attributes: [new Attribute('answer','Number')]});
          question.attributes[1].value = 42;
          return question.getAttributeValue('answer');
        });
      });
      test.heading('setAttributeValue(attributeName,value)', function () {
        test.example('throws an error if the attribute does not exists', Error('attribute not valid for model'), function () {
          new SurrogateModelClass().setAttributeValue('whatever');
        });
        test.example("sets the value for given attribute", 42, function () {
          var question = new SurrogateModelClass({attributes: [new Attribute('answer','Number')]});
          question.setAttributeValue('answer',42);
          return question.attributes[1].value;
        });
      });

    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
