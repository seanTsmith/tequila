# tequila [![Build Status](https://secure.travis-ci.org/dremoor/tequila.png)](http://travis-ci.org/dremoor/tequila) 
Tequila is a application framework for single page web apps and cell phone apps via phonegap.

Demo: http://dremoor.github.io/tequila/samples/bootstrap3-panels-interface-sample/

Specs/Docs/Tests: http://dremoor.github.io/tequila/test-spec/test-runner

## TODO
- create local-store
- implement /lib/stores/local-test.js & /lib/stores/local-store.js

- Command class functions should not need to call this.complete() ... should be automatic
- Attribute image type
- Attribute visible property
- make remote command type or flag as remote
- getlist needs next item to detect end ? or need hasMoreItems ?
- make a prettyprint function for model
- getList should do a list.firstItem();
- model.set({name:value}) should be like model.set('name',value})
- Session Model
- make validation for types
- have stores validate before saving
- create redis-store
- create json-file-store
- create package-store (sound, image, pdf, misc subclass resource-class make attribute type)
- tequilaStore needs to be set not hard coded
- fix Test variations on getList method test for remote stores
- Use confess / phantomJS to make cache manifest

## Project Root
+ **/bin** tequila command line interface
+ **/lib** tequila library source code
+ [**/test-spec**](test-spec/README.md) Tequila Specifications, Documentation, Unit Tests, Integration Tests & Regression Tests



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/dremoor/tequila/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
