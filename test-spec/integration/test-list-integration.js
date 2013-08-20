/**
 * tequila
 * test-list-integration
 */
test.runnerListIntegration = function () {
  test.heading('List Integration', function () {
    test.example('Exercise list methods', undefined, function () {
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
        ['Jack Nicholson',    1937, true],
        ['Meryl Streep',      1949, false],
        ['Marlon Brando',     1924, true],
        ['Cate Blanchett',    1969, false],
        ['Robert De Niro',    1943, true],
        ['Judi Dench',        1934, false],
        ['Al Pacino',         1940, true],
        ['Nicole Kidman',     1967, false],
        ['Daniel Day-Lewis',  1957, true],
        ['Shirley MacLaine',	1934, false],
        ['Dustin Hoffman',    1937, true],
        ['Jodie Foster',      1962, false],
        ['Tom Hanks',         1956, true],
        ['Kate Winslet',      1975, false],
        ['Anthony Hopkins',   1937, true],
        ['Angelina Jolie',    1975, false],
        ['Paul Newman',       1925, true],
        ['Sandra Bullock',    1964, false],
        ['Denzel Washington', 1954, true],
        ['Renée Zellweger',   1969, false]
      ];

      // Build List
      for (var i in actorsInfo) {
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

      // Test movement thru list
      actors.firstItem();
      test.assertion(actors.get('name') == 'Jack Nicholson');
      test.shouldThrow(Error('item not found'), function () {
        actors.previousItem();  // can't go past top
      });
      actors.nextItem();
      test.assertion(actors.get('name') == 'Meryl Streep');
      actors.lastItem();
      test.assertion(actors.get('name') == 'Renée Zellweger');

      // Sort the list
      actors.sort({born: -1});  // Youngest actor
      actors.firstItem();
      test.assertion(actors.get('name') == 'Kate Winslet' || actor.get('name') == 'Angelina Jolie');
      actors.sort({born: 1});  // Oldest actor
      actors.firstItem();
      test.assertion(actors.get('name') == 'Marlon Brando');
    });
  });
};
