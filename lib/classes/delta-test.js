/**
 * tequila
 * delta-test
 */
test.runnerDelta = function () {
  test.heading('Delta Class', function () {
    test.paragraph('Delta\'s represent changes to models.  They used for CRUD operations and logging changes.');
    test.xexample('', undefined, function () {
      /* TODO

       PROPERTIES
        model - delta applies to this model
        crud - can be ['create', 'replace', 'update', 'delete']
        attributeValues - {attribute:[before,after]}  before and after attribute values represent the model
          attribute value changes. If the model attribute is type Table then attributeValues is array of
          attributeValues corresponding to model -> attribute -> group....

       */
    });

  });
};