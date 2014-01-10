/**
 * tequila
 * list-test
 */

test.runnerList = function (SurrogateListClass, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('List Class', function () {
    test.paragraph('Lists are an ordered collection of items.  Each item is an array of values that correspond to the attributes for model used in constructor.');
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
      test.heading('clear()', function () {
        test.example('clear the list.', 0, function () {
          return new List(new Model).addItem(new Model).clear().length();
        });
      });
      test.heading('get(attributeName)', function () {
        test.paragraph('Gets value of attribute for given item.');
        test.example('throws error if no current item', Error('list is empty'), function () {
          new List(new Model()).get('id'); // see integration tests
        });
      });
      test.heading('set(attributeName,value)', function () {
        test.paragraph('Sets value of attribute for given item.');
        test.example('throws error if no current item', Error('list is empty'), function () {
          new List(new Model()).set('id'); // see integration tests
        });
        test.example('throws an error if the attribute does not exists', Error('attribute not valid for list model'), function () {
          var list = new List(new Model);
          list.addItem(new Model);
          list.set('whatever');
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
      test.heading('moveNext()', function () {
        test.example('move to next item in list', false, function () {
          return new List(new Model).moveNext(); // Returns true when move succeeds
        });
      });
      test.heading('movePrevious()', function () {
        test.example('move to the previous item in list', false, function () {
          return new List(new Model).movePrevious(); // Returns true when move succeeds
        });
      });
      test.heading('moveFirst()', function () {
        test.example('move to the first item in list', false, function () {
          return new List(new Model).moveFirst(); // Returns true when move succeeds
        });
      });
      test.heading('moveLast()', function () {
        test.example('move to the last item in list', false, function () {
          return new List(new Model).moveLast(); // Returns true when move succeeds
        });
      });
      test.heading('sort(key)', function () {
        test.example('sort 1,2 in reverse order and return first element', Error('sort order required'), function () {
          new List(new Model).sort(); // see integration tests
        });
      });
    });
    test.runnerListIntegration();
  });
  T.inheritanceTest = inheritanceTestWas;
};
