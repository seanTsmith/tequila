/**
 * tequila
 * test-store
 */
test.runnerStoreIntegration = function () {
  test.heading('Store Integration', function () {
    test.paragraph('');
    test.heading('CRUD (Create Read Update Delete)', function () {
      test.example('Exercise and verify CRUD functionality.', undefined, function () {
        // Create a memory store to test
        var store = new MemoryStore();
        // Futbol Americano
        var Team = function (args) {
          Model.call(this, args);
          this.modelType = "Team";
          this.attributes.push(new Attribute('division'));
          this.attributes.push(new Attribute('club'));
          this.attributes.push(new Attribute('stadium'));
        };
        Team.prototype = T.inheritPrototype(Model.prototype);
        var Player = function (args) {
          Model.call(this, args);
          this.modelType = "Player";
          this.attributes.push(new Attribute('player'));
          this.attributes.push(new Attribute('position'));
          this.attributes.push(new Attribute('team', 'ID'));
        };
        Player.prototype = T.inheritPrototype(Model.prototype);
        var ravens = new Team();
        ravens.setAttributeValue('club', 'Ravens');
        store.putModel(ravens, function (model, error) {
          if (!error) {
            var flacco = new Player();
            flacco.setAttributeValue('player', 'Joe Flacco');
            flacco.setAttributeValue('team', model.getAttributeValue('id'));
            store.putModel(flacco, function (model, error) {
              test.show(model);
            });
          }
        });
      });
    });
  });
};
