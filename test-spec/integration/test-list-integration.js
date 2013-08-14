/**
 * tequila
 * test-list-integration
 */
test.runnerListIntegration = function () {
  test.heading('List Integration', function () {
    test.example('Excersize liste methods', undefined, function () {

      // Create actor class
      var Actor = function (args) {
        Model.call(this, args);
        this.modelType = "Actor";
        this.attributes.push(new Attribute('name'));
        this.attributes.push(new Attribute('born', 'Number'));
      };
      Actor.prototype = T.inheritPrototype(Model.prototype);

      // Create list of actors
      var actor = new Actor();
      var actors = new List(actor);
      var actorsInfo = [
        ['Jack Nicholson', 1937],
        ['Marlon Brando', 1924],
        ['Robert De Niro', 1943],
        ['Al Pacino', 1940],
        ['Daniel Day-Lewis', 1957],
        ['Dustin Hoffman', 1937],
        ['Tom Hanks', 1956],
        ['Anthony Hopkins', 1937],
        ['Paul Newman', 1925],
        ['Denzel Washington', 1954]
      ];

      // Build List
      for (var i in actorsInfo) {
        actor.set('name', actorsInfo[i][0]);
        actor.set('born', actorsInfo[i][1]);
        actors.addItem(actor);
      }

      // Test movement thru list
      actors.firstItem();
      test.assertion(actor.get('name') == 'Jack Nicholson');
      test.shouldThrow(Error('item not found'), function () {
        actors.previousItem();  // can't go past top
      });
      actors.nextItem();
      test.assertion(actor.get('name') == 'Marlon Brando');
      actors.lastItem();
      test.assertion(actor.get('name') == 'Denzel Washington');

      // Sort the list
      actors.sort({born: -1});  // Youngest actor
      actors.firstItem();
      test.assertion(actor.get('name') == 'Daniel Day-Lewis');
      actors.sort({born: 1});  // Oldest actor
      actors.firstItem();
      test.assertion(actor.get('name') == 'Marlon Brando');

    });


  });
};

