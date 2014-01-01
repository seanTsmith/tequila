# tequila [![Build Status](https://secure.travis-ci.org/dremoor/tequila.png)](http://travis-ci.org/dremoor/tequila) 
Tequila is an javascript application framework.  It runs on node server and html5 browsers.

## Project Goals:

* Provide high level abstractions to simplify application development
* Facilitate design pattern practices
* Adherence to test driven design and development
* Utilize 3rd party libraries but provide facades and adapters to keep the app simple, flexible and extensible

####Sample app
http://dremoor.github.io/tequila/samples/bootstrap3-panels-interface-sample/

####Tequila Specifications, Documentation, Unit Tests, Integration Tests & Regression Tests
http://dremoor.github.io/tequila/test-spec/test-runner

## Install
- git it
- npm install it
- make it

#### To do now
- Command class functions should not need to call this.complete() ... should be automatic
- getlist needs next item to detect end ? or need hasMoreItems ?
- model.set({name:value}) should be like model.set('name',value})
- make validation for types
- have stores validate before saving
- Session Model

#### To do later
- tequilaStore needs to be set not hard coded
- Attribute image type
- Attribute visible property
- make remote command type or flag as remote ? or just do it automatically if not handled locally ?

#### To do even later
- create redis-store
- create json-file-store
- create package-store (sound, image, pdf, misc subclass resource-class make attribute type)
- fix Test variations on getList method test for remote stores
- Use confess / phantomJS to make cache manifest

## Project Root
+ **/bin** tequila command line interface
+ **/lib** tequila library source code
+ [**/test-spec**](test-spec/README.md) 

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/dremoor/tequila/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
