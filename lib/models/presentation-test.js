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
        test.assertion(presentation.get('contents') === null);
      });
    });
    test.heading('METHODS', function () {
      test.heading('modelConstructor', function () {
        test.paragraph('This is a reference to the constructor function to create a new model');
      });
    });

  });
};
