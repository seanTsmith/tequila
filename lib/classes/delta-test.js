/**
 * tequila
 * delta-test
 */
test.runnerDelta = function () {
  test.heading('Delta Class', function () {
    test.paragraph('Deltas represent changes to models.  They used for CRUD operations and logging changes.');
    test.example('', undefined, function () {
      /* TODO

       PROPERTIES
       created - date when delta created and put in user workspace
        model - delta applies to this model
        crud - can be ['create', 'replace', 'update', 'delete']
        attributeValues - {attribute:[before,after]}  before and after attribute values represent the model
          attribute value changes. If the model attribute is type Table then attributeValues is array of
          attributeValues corresponding to model -> attribute -> group....


       */
    });

  });
};