/**
 * tequila
 * test-store
 */
test.runnerStoreIntegration = function () {
  test.heading('Store Integration', function () {
    test.paragraph('');
    test.heading('CRUD (Create Read Update Delete)', function () {
      test.example('Exercise and verify CRUD functionality.', undefined, function () {

        // setup store and stooge class
        this.store = new MemoryStore();
        this.Stooge = function (args) {
          Model.call(this, args);
          this.modelType = "Stooge";
          this.attributes.push(new Attribute('name'));
        };
        this.Stooge.prototype = T.inheritPrototype(Model.prototype);

        // create initial stooges
        this.moe = new this.Stooge();
        this.moe.setAttributeValue('name', 'Moe');
        this.larry = new this.Stooge();
        this.larry.setAttributeValue('name', 'Larry');
        this.shemp = new this.Stooge();
        this.shemp.setAttributeValue('name', 'Shemp');

        // IDs after stored will be here
        this.stoogeIDsStored = [];
        this.stoogesRetrieved = [];

        // store the stooges
        this.store.putModel(this.moe, stoogeStored, this); // todo unit test this / self
        this.store.putModel(this.larry, stoogeStored, this);
        this.store.putModel(this.shemp, stoogeStored, this);

        // callback after storing stooges
        function stoogeStored(model, error, self) {
          if (typeof error != 'undefined') throw error;
          self.stoogeIDsStored.push(model.getAttributeValue('id'));
          if (self.stoogeIDsStored.length == 3) {
            // Now that first 3 stooges are stored lets retrieve and verify
            var actors = [];
            for (var i = 0; i < 3; i++) {
              actors.push(new self.Stooge());
              actors[i].setAttributeValue('id', self.stoogeIDsStored[i]);
              self.store.getModel(actors[i], stoogeRetrieved, self);
            }
          }
        }

        // callback after retrieving stored stooges
        function stoogeRetrieved(model, error, self) {
          if (typeof error != 'undefined') throw error;
          self.stoogesRetrieved.push(model);
          if (self.stoogesRetrieved.length == 3) {
            // Now we have stored and retrieved (via IDs into new objects).  So verify the stooges made it
            var stoogez = [];
            for (var i=0; i<3; i++) stoogez.push(self.stoogesRetrieved[i].getAttributeValue('name'));
            test.assertion(T.contains(stoogez,'Moe'));
            test.assertion(T.contains(stoogez,'Larry'));
            test.assertion(T.contains(stoogez,'Shemp'));
            // Replace Shemp with Curly
            for (var i=0; i<3; i++) {
              if (self.stoogesRetrieved[i].getAttributeValue('name') == 'Shemp') {
                self.stoogesRetrieved[i].setAttributeValue('name','Curly');
                self.store.putModel(self.stoogesRetrieved[i], stoogeStored2, self);
              }
            }
          }
        }
        // callback after storing changed stooge
        function stoogeStored2(model, error, self) {
          if (typeof error != 'undefined') throw error;
          // See if change test passed
          test.show(model.getAttributeValue('name'));
          test.assertion(model.getAttributeValue('name')=='Curly Clone'); // fucked because memorystore needs to clone models first!
          // Now test delete
//          self.store.deleteModel(model,stoogeDeleted)
        }

        // callback after storing changed stooge
        function stoogeDeleted(model, error, self) {
//          if (error) throw error;
//          // See if change test passed
//          test.assertion(model.getAttributeValue('name')=='Curly');
        }

      });
    });
  });
};
