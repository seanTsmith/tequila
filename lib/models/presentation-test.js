/**
 * tequila
 * presentation-test
 */
test.runnerPresentation = function () {
  test.heading('Presentation Model', function () {
    test.paragraph('The Presentation Model represents the way in which a model is to be presented to the user.  ' +
      'The presentation is meant to be a "hint" to a Interface object.  ' +
      'The specific Interface object will represent the model data according to the Presentation object.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Presentation', true, function () {
        return new Presentation() instanceof Presentation;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Presentation, true);
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('model', function () {
        test.paragraph('This is a model instance for the presentation instance.');
      });
      test.heading('validationErrors', function () {
        test.example('Array of errors', undefined, function () {
          test.assertion(new Presentation().validationErrors instanceof Array);
          test.assertion(new Presentation().validationErrors.length == 0);
        });
      });
      test.heading('validationMessage', function () {
        test.example('string description of error(s)', '', function () {
          return new Presentation().validationMessage;
        });
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.paragraph('Presentation extends model and inherits the attributes property.  All Presentation objects ' +
        'have the following attributes:');
      test.example('following attributes are defined:', undefined, function () {
        var presentation = new Presentation(); // default attributes and values
        test.assertion(presentation.get('id') === null);
        test.assertion(presentation.get('name') === null);
        test.assertion(presentation.get('modelName') === null);
        test.assertion(presentation.get('contents') instanceof Array);
      });
    });
    test.heading('METHODS', function () {
      test.heading('modelConstructor', function () {
        test.paragraph('This is a reference to the constructor function to create a new model');
        test.xexample('', undefined, function () {
        });
      });
      test.heading('validate', function () {
        test.paragraph('check valid object state then extend to presentation contents');
        test.example('callback is required -- see integration', Error('callback is required'), function () {
          new Presentation().validate();
        });
      });
    });
    test.heading('CONTENTS', function () {
      test.paragraph('The contents attributes provides the structure for the presentation.');
      test.example('content must be an array', 'contents must be Array', function () {
        var pres = new Presentation();
        pres.set('contents', true);
        return pres.getObjectStateErrors();
      });
      test.example('array elements must be Command , Attribute or String', 'contents elements must be Command, Attribute or string', function () {
        var pres = new Presentation();
        // strings with prefix # are heading, a dash - by itself is for a visual separator
        pres.set('contents', ['#heading', new Command(), new Attribute({name: 'meh'})]);
        test.assertion(pres.getObjectStateErrors().length == 0);
        pres.set('contents', [new Command(), new Attribute({name: 'meh'}), true]);
        return pres.getObjectStateErrors();
      });
    });
    test.heading('INTEGRATION', function () {
      test.example('validation usage demonstrated', test.asyncResponse('contents has validation errors'), function (testNode, returnResponse) {
        var attribute = new Attribute({name:'test'});
        var presentation = new Presentation(); // default attributes and values
        presentation.set('contents',[
          attribute
        ]);
        attribute.setError('test','test error');
        presentation.validate(function() {
          returnResponse(testNode, presentation.validationMessage);
        });
      });
    });
  });
};
