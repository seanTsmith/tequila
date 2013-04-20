/**
 * tequila
 * store-test
 */
test.runnerStoreModel = function (SurrogateStoreModel, isSubClass) {
  test.heading(isSubClass?'Store tests are applied':'Store', function () {
    if (!isSubClass)
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
        test.assertion(typeof interface['canGetModel'] == 'boolean');
        test.assertion(typeof interface['canPutModel'] == 'boolean');
        test.assertion(typeof interface['canDeleteModel'] == 'boolean');
      });
      var interface = new SurrogateStoreModel().getStoreInterface();
      test.heading('getModel', function () {
        if (interface['canGetModel']) {
          test.example('must pass valid model', Error('argument must be a Model'), function () {
            new SurrogateStoreModel().getModel();
          });
          test.example('model must have no validation errors', Error('model has validation errors'), function () {
            var m = new Model();
            m.attributes = null;
            new SurrogateStoreModel().getModel(m);
          });
          test.example('ID attribute must have truthy value', Error('ID not set'), function () {
            new SurrogateStoreModel().getModel(new Model());
          });
          test.example('callback function required', Error('callback required'), function () {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().getModel(m);
          });
          test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().getModel(m,function(mod,err) {
              if (err) {
                returnResponse(testNode,err);
              } else {
                returnResponse(testNode,mod);
              }
            });
          });
        } else{
          test.example('getModel() is not implemented', Error(new SurrogateStoreModel().modelType+ ' does not provide getModel'), function () {
            new SurrogateStoreModel().getModel();
          });
        }
      });
      test.heading('putModel', function () {
        if (interface['canPutModel']) {
          test.example('must pass valid model', Error('argument must be a Model'), function () {
            new SurrogateStoreModel().putModel();
          });
          test.example('model must have no validation errors', Error('model has validation errors'), function () {
            var m = new Model();
            m.attributes = null;
            new SurrogateStoreModel().putModel(m);
          });
          test.example('callback function required', Error('callback required'), function () {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().putModel(m);
          });
          test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().putModel(m,function(mod,err) {
              if (err) {
                returnResponse(testNode,err);
              } else {
                returnResponse(testNode,mod);
              }
            });
          });
        } else {
          test.example('putModel() is not implemented', Error('Store does not provide putModel'), function () {
            new SurrogateStoreModel().putModel();
          });
        }
      });
      test.heading('deleteModel', function () {
        if (interface['canDeleteModel']) {
          test.example('must pass valid model', Error('argument must be a Model'), function () {
            new SurrogateStoreModel().deleteModel();
          });
          test.example('model must have no validation errors', Error('model has validation errors'), function () {
            var m = new Model();
            m.attributes = null;
            new SurrogateStoreModel().deleteModel(m);
          });
          test.example('callback function required', Error('callback required'), function () {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().deleteModel(m);
          });
          test.example('returns error when model not found', test.AsyncResponse(Error('model not found in store')), function (testNode, returnResponse) {
            var m = new Model();
            m.attributes[0].value = 1;
            new SurrogateStoreModel().deleteModel(m,function(mod,err) {
              if (err) {
                returnResponse(testNode,err);
              } else {
                returnResponse(testNode,mod);
              }
            });
          });
        } else {
          test.example('deleteModel() is not implemented', Error('Store does not provide deleteModel'), function () {
            new SurrogateStoreModel().deleteModel();
          });
        }
      });
    });
  });
};
