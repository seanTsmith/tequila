/**
 * tequila
 * tequila-spec
 */
test.start();
test.heading('CLASS LIBRARY', function () {
  test.paragraph('The class library is a set of base class definitions that are extended into subclasses then' +
    ' can be instantiated for usage.  The inheritance is via javascript prototypical inheritance in conjunction' +
    ' with a helper function to extend the prototype of objects.');
  test.runnerTequila();
  test.runnerAttribute();
  test.runnerModel(Model,false);
  test.runnerCollection(Collection,false);
});
test.heading('CORE MODELS', function () {
  test.paragraph('These are models that are defined as part of the tequila core and are used in this library.');
  test.runnerUserModel();
  test.heading('Store', function () {
    test.paragraph('This models of the context that objects are run against.  This is an abstract' +
      ' representation of object persistence and not implementation. A pure store can be thought of as the concept' +
      ' of a dataset whereas a StoreInterface would');
    test.example('todo');
  });
  test.heading('Interface', function () {
    test.paragraph('The interface model is used to provide an interface to external systems (to this library).' +
      ' This includes storage interfaces and user interfaces.  This is an abstract class and after implemented in' +
      ' UserInterface and StorageInterface models.');
    test.example('todo');
  });
  test.heading('NullInterface', function () {
    test.paragraph('This is a subclass of Interface that used for testing completion.');
    test.example('todo');
  });
  test.heading('UserInterface', function () {
    test.paragraph('This is a subclass of Interface that represents a device with a User context.');
    test.example('todo');
  });
  test.heading('StoreInterface', function () {
    test.paragraph('This is a subclass of Interface that represents a device with a Store context.');
    test.example('todo');
  });
  test.heading('MemoryStoreInterface', function () {
    test.paragraph('The memory store is a StorageInterface implementation.  It is a StorageInterface subclass' +
      ' that provides a testing interface for the Interface class as it implements full functionality.  It can' +
      ' be extended as a memory cache with persistent storage if configured with external Store systems.');
    test.example('todo');
  });
});
test.heading('SYSTEM INTEGRATION', function () {
  test.paragraph('This area contains system integration test and further documents the usage of this library.');
});
test.stop();
