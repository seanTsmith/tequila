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
//      test.example('must create with model constructor', Error('must create with model constructor'), function () {
//        new Presentation();
//      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Presentation, true);
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('model', function () {
        test.paragraph('This is a model instance for the presentation instance.');
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
      });
    });
    test.heading('CONTENTS', function () {
      test.paragraph('The contents attributes provides the structure for the presentation.');
      test.example('content must be an array', 'contents must be Array', function () {
        var pres = new Presentation();
        pres.set('contents', true);
        return pres.getValidationErrors();
      });
      test.example('array elements must be Command , Attribute or String', 'contents elements must be Command, Attribute or string', function () {
        var pres = new Presentation();
        // strings with prefix # are heading, a dash - by itself is for a visual seperator
        pres.set('contents', ['#heading', new Command(), new Attribute({name: 'meh'})]);
        test.assertion(pres.getValidationErrors().length == 0);
        pres.set('contents', [new Command(), new Attribute({name: 'meh'}), true]);
        return pres.getValidationErrors();
      });

    });
  });
};
