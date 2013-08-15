/**
 * tequila
 * list-test
 */

test.runnerList = function (SurrogateListClass, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('List Class', function () {
    test.paragraph('Lists are used to store');
    test.heading('CONSTRUCTOR', function () {
      test.paragraph('Creation of all Collections must adhere to following examples:');
      test.example('objects created should be an instance of List', true, function () {
        return new SurrogateListClass(new Model) instanceof List;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        List();
      });
      test.example('must be instantiated with model parameter.  The model attributes represent the list columns.', Error('argument required: model'), function () {
        new List();
      });
    });
    test.heading('PROPERTIES', function () {
    });
    test.heading('METHODS', function () {
      test.heading('length()', function () {
        test.example('length method returns the number of items in the list.', 0, function () {
          return new List(new Model).length();
        });
      });
      test.heading('addItem()', function () {
        test.example('add item to list verify length is correct.', 1, function () {
          var list = new List(new Model);
          return list.addItem(new Model).length(); // returns ref for method chaining
        });
      });
      test.heading('removeItem()', function () {
        test.example('add then item to list verify length is correct.', 0, function () {
          var list = new List(new Model);
          return list.addItem(new Model).removeItem().length(); // returns ref for method chaining
        });
      });
      test.heading('nextItem()', function () {
        test.example('move to next item in list', Error('list is empty'), function () {
          new List(new Model).nextItem(); // see integration tests
        });
      });
      test.heading('previousItem()', function () {
        test.example('move to the previous item in list', Error('list is empty'), function () {
          new List(new Model).previousItem(); // see integration tests
        });
      });
      test.heading('firstItem()', function () {
        test.example('move to the first item in list', Error('list is empty'), function () {
          new List(new Model).firstItem(); // see integration tests
        });
      });
      test.heading('lastItem()', function () {
        test.example('move to the last item in list', Error('list is empty'), function () {
          new List(new Model).lastItem(); // see integration tests
        });
      });
      test.heading('sort(key)', function () {
        test.example('sort 1,2 in reverse order and return first element', Error('sort order required'), function () {
          new List(new Model).sort(); // see integration tests
        });
      });
    });
  });
  T.inheritanceTest = inheritanceTestWas;
};
