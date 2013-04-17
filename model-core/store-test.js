/**
 * tequila
 * store-test
 */
test.runnerStoreModel = function (SurrogateStoreModel) {
  var root = (SurrogateStoreModel.modelType=='Store');
  test.heading(root?'Store':'Store tests are applied', function () {
    if (root)
      test.paragraph('The store class is used for object persistence.');
    test.example('objects created should be an instance of Store', true, function () {
      return new SurrogateStoreModel() instanceof Store;
    });
    test.heading('Model tests are applied', function () {
      test.runnerModel(SurrogateStoreModel, true);
    });
    test.heading('METHODS', function () {
      test.example('getStoreInterface() returns an array of method implementation for the Store.', undefined, function () {
        var interface = new SurrogateStoreModel().getStoreInterface();
        test.show(interface);
        test.assertion(interface instanceof Object);
        test.assertion(typeof interface['getModel'] == 'boolean');
        test.assertion(typeof interface['putModel'] == 'boolean');
        test.assertion(typeof interface['deleteModel'] == 'boolean');
      });
      var interface = new SurrogateStoreModel().getStoreInterface();
      if (interface['getModel']) {
        test.example('getModel(model) must pass valid model', Error('argument must be a Model'), function () {
          new SurrogateStoreModel().getModel();
        });
        test.xexample('getModel(model) must have ID set', Error('xxx'), function () {
          new SurrogateStoreModel().getModel(new Model());
        });

      } else{
        test.example('getModel() is not implemented', Error('Store does not provide getModel'), function () {
          new SurrogateStoreModel().getModel();
        });
      }
      if (interface['putModel']) {
        test.example('putModel() is not implemented', undefined, function () {
          new SurrogateStoreModel().putModel();
        });
      } else {
        test.example('putModel() is not implemented', Error('Store does not provide putModel'), function () {
          new SurrogateStoreModel().putModel();
        });
      }
      if (interface['deleteModel']) {
        test.example('deleteModel() is not implemented', undefined, function () {
          new SurrogateStoreModel().deleteModel();
        });
      } else {
        test.example('deleteModel() is not implemented', Error('Store does not provide deleteModel'), function () {
          new SurrogateStoreModel().deleteModel();
        });
      }
    });
  });
};
