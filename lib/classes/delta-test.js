/**
 * tequila
 * delta-test
 */
test.runnerDelta = function () {
  test.heading('Delta Class', function () {
    test.paragraph('Deltas represent changes to models.  They can be applied to a store then update the model.  ' +
      'They can be stored in logs as a change audit for the model.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Delta', true, function () {
        return new Delta(new Attribute.ModelID(new Model())) instanceof Delta;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Delta();
      });
      test.example('Attribute.ModelID required in constructor', Error('Attribute.ModelID required in constructor'), function () {
        new Delta();
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('dateCreated', function () {
        test.example('set to current date/time on creation', true, function () {
          var delta = new Delta(new Attribute.ModelID(new Model()));
          test.show(delta.dateCreated);
          return delta.dateCreated instanceof Date;
        });
      });
      test.heading('modelID', function () {
        test.example('set from constructor', "ModelID(Model:null)", function () {
          var delta = new Delta(new Attribute.ModelID(new Model()));
          test.show(delta.dateCreated);
          return delta.modelID.toString();
        });
      });
      test.heading('attributeValues', function () {
        test.example('created as empty object', {}, function () {
          // attributeValues - {attribute:[before,after]}  before and after attribute values represent the model
          // attribute value changes. If the model attribute is type Table then attributeValues is array of
          // attributeValues corresponding to model -> attribute -> group....
          return new Delta(new Attribute.ModelID(new Model())).attributeValues;
        });
      });
    });
  });
};
