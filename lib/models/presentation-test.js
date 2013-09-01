/**
 * tequila
 * presentation-test
 */
test.runnerPresentation = function () {
  test.heading('Presentation Model', function () {
    test.paragraph('This model represents the way in which a model is to be presented to the user.');
    test.xexample('', false, function () {
      /* TODO
       CONSTRUCTOR

       PROPERTIES

       model - points to model from which presentation is created and CRUD op
       ID - the ID of the model being presented - if null then new (n/a if no model)
       attributes - if null then model-attributes used for presentation (one or other needed)
       commands - commands available, built in predefined commands as follows:
          store

       METHODS

       from command... check it ...

         View - presents a model for display and CRUD purposes
         contents is object with following properties:
         model - the model being presented
         ID - the ID of the model being presented - if null then new
         viewModel - points to model used for presentation - if null then model used
         commands - additional commands available

         Dialog - presents a dialog for user interaction
         contents is object with following properties:
         dialogModel - points to model used for presentation
         commands - additional commands available



       */
    });
  });
};