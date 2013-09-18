# tequila [![Build Status](https://secure.travis-ci.org/dremoor/tequila.png)](http://travis-ci.org/dremoor/tequila)

Tequila es bueno!

==========================
TODO DOUG:
==========================
- implement /lib/stores/local-test.js & /lib/stores/local-store.js
- install http://redis.io/ on tgiCloud Server
- implement /lib/stores/redis-test.js & /lib/stores/redis-store.js .. make it look for tgicloud.com redis
- test with /test-spec/integration/test-store-integration.js
- thought you had phonegap app for tests - test localstore with it

==========================

From PCM experience:
- Make ID fields stored as ObjectIDs in mongo
- make a prettyprint function for model
- getList should do a list.firstItem();
- model.set({name:value}) should be like model.set('name',value})

App
- Run (interface, callback)
    callback invoked when app terminates

Interface
- Start (command, callback)

Attribute
- image type
- visible property

* Session Model
* make validation for types
* have stores validate before saving
* create redis-store
* create local-store
* create json-file-store
* create cookie-store
* create package-store (sound, image, pdf, misc subclass resource-class make attribute type)
* tequilaStore needs to be set not hard coded
* fix Test variations on getList method test for remote stores
* Use confess / phantomJS to make cache manifest

## Project Root
+ **/bin** tequila command line interface
+ **/lib** tequila library source code
+ [**/test-spec**](test-spec/README.md) Tequila Specifications, Documentation, Unit Tests, Integration Tests & Regression Tests
