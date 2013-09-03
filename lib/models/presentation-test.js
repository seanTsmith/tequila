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
        test.paragraph('points to model from which presentation is created and CRUD op');
      });
      test.heading('ID', function () {
        test.paragraph('the ID of the model being presented - if null then new (n/a if no model)');
      });
      test.heading('attributes', function () {
        test.paragraph('if null then model-attributes used for presentation (one or other needed)');
      });
      test.heading('commands', function () {
        test.paragraph('commands available, if string then built in predefined command ex: \'store\'');
      });
    });

    test.heading('ATTRIBUTES', function () {
      test.paragraph('Presentation extends model and inherits the attributes property.  All Presentation objects ' +
        'have the following attributes:');
    });
    test.example('following attributes are defined:', undefined, function () {
      var presentation = new Presentation(); // default attributes and values
      test.assertion(presentation.get('id') === null);
      test.assertion(presentation.get('name') === null);
    });


  });
};
