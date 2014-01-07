/**
 * tequila
 * test-list-integration
 */
test.runnerListIntegration = function () {
  test.heading('List Integration', function () {
    test.heading('List methods are tested here', function () {
      test.example('list movement and sorting', undefined, function () {
        // Create actor class
        var Actor = function (args) {
          Model.call(this, args);
          this.modelType = "Actor";

          this.attributes.push(new Attribute('name'));
          this.attributes.push(new Attribute('born', 'Number'));
          this.attributes.push(new Attribute('isMale', 'Boolean'));
        };
        Actor.prototype = T.inheritPrototype(Model.prototype);

        // Create list of actors
        var actor = new Actor();
        var actors = new List(actor);
        var actorsInfo = [
          // Actor              Born  Male
          ['Jack Nicholson', 1937, true],
          ['Meryl Streep', 1949, false],
          ['Marlon Brando', 1924, true],
          ['Cate Blanchett', 1969, false],
          ['Robert De Niro', 1943, true],
          ['Judi Dench', 1934, false],
          ['Al Pacino', 1940, true],
          ['Nicole Kidman', 1967, false],
          ['Daniel Day-Lewis', 1957, true],
          ['Shirley MacLaine', 1934, false],
          ['Dustin Hoffman', 1937, true],
          ['Jodie Foster', 1962, false],
          ['Tom Hanks', 1956, true],
          ['Kate Winslet', 1975, false],
          ['Anthony Hopkins', 1937, true],
          ['Angelina Jolie', 1975, false],
          ['Paul Newman', 1925, true],
          ['Sandra Bullock', 1964, false],
          ['Denzel Washington', 1954, true],
          ['Renée Zellweger', 1969, false]
        ];

        // Build List
        for (var i in actorsInfo) {
          if (actorsInfo.hasOwnProperty(i)) {
            if (actorsInfo[i][2]) { // for some populate model then add to list
              actor.set('name', actorsInfo[i][0]);
              actor.set('born', actorsInfo[i][1]);
              actor.set('isMale', actorsInfo[i][2]);
              actors.addItem(actor);
            } else {
              actors.addItem(); // add blank then set attribs
              actors.set('name', actorsInfo[i][0]);
              actors.set('born', actorsInfo[i][1]);
              actors.set('isMale', actorsInfo[i][2]);
            }
          }
        }

        // Test movement thru list
        actors.moveFirst();
        test.assertion(actors.get('name') == 'Jack Nicholson');
        actors.moveNext();
        test.show(actors.get('name'));
        test.assertion(actors.get('name') == 'Meryl Streep');
        actors.moveLast();
        test.show(actors.get('name'));
        test.assertion(actors.get('name') == 'Renée Zellweger');

        // Sort the list
        actors.sort({born: -1});  // Youngest actor
        actors.moveFirst();
        test.assertion(actors.get('name') == 'Kate Winslet' || actor.get('name') == 'Angelina Jolie');
        actors.sort({born: 1});  // Oldest actor
        actors.moveFirst();
        test.assertion(actors.get('name') == 'Marlon Brando');
      });
      test.example('Test variations on getList method.', test.asyncResponse(true), function (testNode, returnResponse) {
        var self = this;
        var storeBeingTested = test.integrationStore.name + ' ' + test.integrationStore.storeType;
        test.show(storeBeingTested);

        // Create list of actors
        self.actorsInfo = [
          // Actor Born Male Oscards
          ['Jack Nicholson', new Date("01/01/1937"), true, 3],
          ['Meryl Streep', Date("01/01/1949"), false, 3],
          ['Marlon Brando', Date("01/01/1924"), true, 2],
          ['Cate Blanchett', Date("01/01/1969"), false, 1],
          ['Robert De Niro', Date("01/01/1943"), true, 2],
          ['Judi Dench', Date("01/01/1934"), false, 1],
          ['Al Pacino', Date("01/01/1940"), true, 1],
          ['Nicole Kidman', Date("01/01/1967"), false, null],
          ['Daniel Day-Lewis', Date("01/01/1957"), true, null],
          ['Shirley MacLaine', Date("01/01/1934"), false, null],
          ['Dustin Hoffman', Date("01/01/1937"), true, null],
          ['Jodie Foster', Date("01/01/1962"), false, null],
          ['Tom Hanks', Date("01/01/1956"), true, null],
          ['Kate Winslet', Date("01/01/1975"), false, null],
          ['Anthony Hopkins', Date("01/01/1937"), true, null],
          ['Angelina Jolie', Date("01/01/1975"), false, null],
          ['Paul Newman', Date("01/01/1925"), true, null],
          ['Sandra Bullock', Date("01/01/1964"), false, null],
          ['Denzel Washington', Date("01/01/1954"), true, null],
          ['Renée Zellweger', Date("01/01/1969"), false, null]
        ];

        // Create actor class
        self.Actor = function (args) {
          Model.call(this, args);
          this.modelType = "Actor";
          this.attributes.push(new Attribute('name'));
          this.attributes.push(new Attribute('born', 'Date'));
          this.attributes.push(new Attribute('isMale', 'Boolean'));
          this.attributes.push(new Attribute('oscarWs', 'Number'));
        };
        self.Actor.prototype = T.inheritPrototype(Model.prototype);
        self.actor = new self.Actor(); // instance to use for stuff

        // Make sure store starts in known state.  Stores such as mongoStore will retain test values.
        // So... use getList to get all Actors then delete them from the Store
        self.list = new List(new self.Actor());
        self.oldActorsKilled = 0;
        self.oldActorsFound = 0;
        try {
          self.killhim = new self.Actor();
          test.integrationStore.getList(self.list, [], function (list, error) {
            if (typeof error != 'undefined') {
              returnResponse(testNode, error);
              return;
            }
            if (list._items.length < 1)
              storeActors();
            else {
              self.oldActorsFound = list._items.length;
              for (var i = 0; i < list._items.length; i++) {
                self.killhim.set('id', list._items[i][0]);
                test.integrationStore.deleteModel(self.killhim, function (model, error) {
                  if (++self.oldActorsKilled >= self.oldActorsFound) {
                    storeActors();
                  }
                })
              }
            }
          });
        }
        catch (err) {
          returnResponse(testNode, err);
          return;
        }

        // Callback after model cleaned
        // now, build List and add to store
        function storeActors() {
          self.actorsStored = 0;
          for (var i=0; i<self.actorsInfo.length; i++) {
            self.actor.set('ID', null);
            self.actor.set('name', self.actorsInfo[i][0]);
            self.actor.set('born', self.actorsInfo[i][1]);
            self.actor.set('isMale', self.actorsInfo[i][2]);
            test.integrationStore.putModel(self.actor, actorStored);
          }
        }

        // Callback after actor stored
        function actorStored(model, error) {
          if (typeof error != 'undefined') {
            returnResponse(testNode, error);
            return;
          }
          if (++self.actorsStored >= self.actorsInfo.length) {
            getAllActors();
          }
        }

        // test getting all 20
        function getAllActors() {
          try {
            test.integrationStore.getList(self.list, {}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 20,'20');
              getTomHanks();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // only one Tom Hanks
        function getTomHanks() {
          try {
            test.integrationStore.getList(self.list, {name: "Tom Hanks"}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 1,('1 not ' + list._items.length));
              getD();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // 3 names begin with D
        // test RegExp
        function getD() {
          try {
            test.integrationStore.getList(self.list, {name: /^D/}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 3,('3 not ' + list._items.length));
              getRZ();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // Renée Zellweger only female starting name with 'R'
        // test filter 2 properties (logical AND)
        function getRZ() {
          try {
            test.integrationStore.getList(self.list, {name: /^R/, isMale: false}, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              test.assertion(list._items.length == 1,('1 not ' + list._items.length));
              list._items.length && test.assertion(list.get('name') == 'Renée Zellweger','rz');
              getAlphabetical();
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }

        // Retrieve list alphabetically by name
        // test order parameter
        function getAlphabetical() {
          try {
            test.integrationStore.getList(self.list, {}, { name: 1 }, function (list, error) {
              if (typeof error != 'undefined') {
                returnResponse(testNode, error);
                return;
              }
              // Verify each move returns true when move succeeds
              test.assertion(list.moveFirst(),'moveFirst');
              test.assertion(!list.movePrevious(),'movePrevious');
              test.assertion(list.get('name') == 'Al Pacino','AP');
              test.assertion(list.moveLast(),'moveLast');
              test.assertion(!list.moveNext(),'moveNext');
              test.assertion(list.get('name') == 'Tom Hanks','TH');
              returnResponse(testNode, true);
            });
          }
          catch (err) {
            returnResponse(testNode, err);
            return;
          }
        }


      });
    });
  });
};
