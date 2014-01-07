/**
 * tequila
 * test-store-integration
 */
test.runnerStoreIntegration = function () {
  test.heading('Store Integration', function () {
    test.heading('CRUD (Create Read Update Delete)', function () {
      test.example('Exercise all store function for one store.', test.asyncResponse(true), function (testNode, returnResponse) {
        var self = this;
        var storeBeingTested = test.integrationStore.name + ' ' + test.integrationStore.storeType;
        test.show(storeBeingTested);

        // If store is not ready then get out...
        if (!test.integrationStore.getServices().isReady) {
          returnResponse(testNode, Error('Store is not ready.'));
          return;
        }

        // setup stooge class
        self.Stooge = function (args) {
          Model.call(this, args);
          this.modelType = "_tempTest_Stooge";
          this.attributes.push(new Attribute('name'));
        };
        self.Stooge.prototype = T.inheritPrototype(Model.prototype);

        // create initial stooges
        self.moe = new self.Stooge();
        self.moe.set('name', 'Moe');
        self.larry = new self.Stooge();
        self.larry.set('name', 'Larry');
        self.shemp = new self.Stooge();
        self.shemp.set('name', 'Shemp');

        // IDs after stored will be here
        self.stoogeIDsStored = [];
        self.stoogesRetrieved = [];
        self.oldStoogesFound = 0;
        self.oldStoogesKilled = 0;

        // Make sure store starts in known state.  Stores such as mongoStore will retain test values.
        // So... use getList to get all stooges then delete them from the Store
        var useListToCleanStart = test.integrationStore.getServices().canGetList;
        if (useListToCleanStart) {
          var list = new List(new self.Stooge());
          try {
            self.killhim = new self.Stooge();
            test.integrationStore.getList(list, [], function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              if (list._items.length < 1)
                storeStooges();
              else
                self.oldStoogesFound = list._items.length;
              for (var i = 0; i < list._items.length; i++) {
                self.killhim.set('id', list._items[i][0]);
                test.integrationStore.deleteModel(self.killhim, function (model, error) {
                  if (++self.oldStoogesKilled >= self.oldStoogesFound) {
                    storeStooges();
                  }
                })
              }
            });
          }
          catch (err) {
            returnResponse(testNode, err);
          }
        } else {
          storeStooges();
        }

        // Callback to store new stooges
        function storeStooges() {
          test.show(self.oldStoogesFound);
          test.show(self.oldStoogesKilled);
          test.integrationStore.putModel(self.moe, stoogeStored);
          test.integrationStore.putModel(self.larry, stoogeStored);
          test.integrationStore.putModel(self.shemp, stoogeStored);
        }

        // callback after storing stooges
        function stoogeStored(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          try {
            self.stoogeIDsStored.push(model.get('id'));
            if (self.stoogeIDsStored.length == 3) {
              test.assertion(true,'here');
              // Now that first 3 stooges are stored lets retrieve and verify
              var actors = [];
              for (var i = 0; i < 3; i++) {
                actors.push(new self.Stooge());
                actors[i].set('id', self.stoogeIDsStored[i]);
                test.integrationStore.getModel(actors[i], stoogeRetrieved);
              }
            }
          }
          catch (err) {
            returnResponse(testNode, err);
          }
        }

        // callback after retrieving stored stooges
        function stoogeRetrieved(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          self.stoogesRetrieved.push(model);
          if (self.stoogesRetrieved.length == 3) {
            test.assertion(true,'here');
            // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
            test.assertion(self.stoogesRetrieved[0] !== self.moe && // Make sure not a reference but a copy
              self.stoogesRetrieved[0] !== self.larry && self.stoogesRetrieved[0] !== self.shemp,'copy');
            var s = []; // get list of names to see if all stooges made it
            for (var i = 0; i < 3; i++) s.push(self.stoogesRetrieved[i].get('name'));
            test.show(s);
            test.assertion(T.contains(s, 'Moe') && T.contains(s, 'Larry') && T.contains(s, 'Shemp'));
            // Replace Shemp with Curly
            var didPutCurly = false;
            for (i = 0; i < 3; i++) {
              if (self.stoogesRetrieved[i].get('name') == 'Shemp') {
                didPutCurly = true;
                self.stoogesRetrieved[i].set('name', 'Curly');
                try {
                  test.integrationStore.putModel(self.stoogesRetrieved[i], stoogeChanged);
                }
                catch (err) {
                  returnResponse(testNode, err);
                }
              }
            }
            if (!didPutCurly) {
              returnResponse(testNode, Error("Can't find Shemp!"));
            }
          }
        }

        // callback after storing changed stooge
        function stoogeChanged(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          test.assertion(model.get('name') == 'Curly','Curly');
          var curly = new self.Stooge();
          curly.set('id', model.get('id'));
          try {
            test.integrationStore.getModel(curly, storeChangedShempToCurly);
          }
          catch (err) {
            returnResponse(testNode, err);
          }
        }

        // callback after retrieving changed stooge
        function storeChangedShempToCurly(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          test.assertion(model.get('name') == 'Curly','Curly');
          // Now test delete
          self.deletedModelId = model.get('id'); // Remember this
          test.integrationStore.deleteModel(model, stoogeDeleted)
        }

        // callback when Curly is deleted
        function stoogeDeleted(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          // model parameter is what was deleted
          test.assertion(model.get('id') == null,'no id'); // ID is removed
          test.assertion(model.get('name') == 'Curly'); // the rest remains
          // Is it really dead?
          var curly = new self.Stooge();
          curly.set('id', self.deletedModelId);
          test.integrationStore.getModel(curly, hesDeadJim);
        }

        // callback after lookup of dead stooge
        function hesDeadJim(model, error) {
          if (typeof error != 'undefined') {
            if ((error != 'Error: id not found in store') && (error != 'Error: model not found in store')) {
              returnResponse(testNode, error);
              return;
            }
          } else {
            returnResponse(testNode, Error('no error deleting stooge when expected'));
            return;
          }
          // Skip List test if subclass can't do
          if (!test.integrationStore.getServices().canGetList) {
            returnResponse(testNode, true);
          } else {
            // Now create a list from the stooge store
            var list = new List(new self.Stooge());
            try {
              test.integrationStore.getList(list, {}, {name:1}, listReady);
            }
            catch (err) {
              returnResponse(testNode, err);
            }
          }
        }

        // callback after list created from store
        function listReady(list, error) {
//          list.sort({name:1});
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          test.assertion(list instanceof List,'is list');
          test.assertion(list.length() == 2,'is 2');
          list.moveFirst();
          test.assertion(list.get('name') == 'Larry','larry');
          list.moveNext();
          test.assertion(list.get('name') == 'Moe','moe');
//          test.assertion(false,'WHAT'); // temp
//          test.assertion(true,'THE'); // temp
//          test.assertion(false,'FUCK'); // temp
          returnResponse(testNode, true);
        }
      });
    });
  });
};
