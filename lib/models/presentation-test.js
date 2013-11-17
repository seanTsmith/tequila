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
      test.example('objects created should be an instance of User', true, function () {
        return new Presentation() instanceof Presentation;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Presentation, true);
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('model', function () {
        test.paragraph('This is a model reference for the presentation.  The value of this model is displayed.  The' +
          ' layout is used unless presentationModel is specified.');
      });
      test.heading('attributes', function () {
        test.paragraph('standard model attributes');
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
        test.assertion(presentation.get('contents') === 3);
        return 'assertions should fail'
      });
    });
    test.heading('METHODS', function () {
      test.heading('modelContructor', function () {
        test.paragraph('This is a reference to the constructor function to create a new model');
      });
      test.heading('attributes', function () {
        test.paragraph('standard model attributes');
      });
    });

  });
};
