#tequila
Tequila es bueno!

DOUG TODO:
* make test(/test-spec/test-runner.html) into app
* and make the store connect to server

TODO:
* create json-file-store
* create cookie-store
* create local-store
* create resource-file-store (sound, image, pdf, misc subclass resource-class make atribute type)
* tequilaStore needs to be set not hard coded
* fix Test variations on getList method test for remote stores
* add visible attribute to attribute and default by type on creation
* Finish INTERFACE design
* why is store a model ? change to class ?

CLASS DESIGN TODO:

* App (Application)
    * execute(Command)
    * Commands
        * Label
        * Function (ex:)
            * ModelView
                * ModelView(model,id) ...  standard CRUD Model processing
                * Command(model,id) ... additional commands for this ModelView
                * Command(model,id)
            * DialogView
                * Title
                * Text
                * Image
                * Group
                    * Control
                * Command
                * Process
            * Javascript Code ... (anything)

    * Structure
        * SubMenu
            * Command
            * Command
        * SubMenu
            * SubMenu
                * Command
                * Command
            * SubMenu
                * Command
                * Command

INTERFACE DESIGN (PART OF TEQUILA)

* <- getApplicationStructure -- returns object with app structure

* -> execute(Command)

* present -- method with function callback

    * Present       -> (dialogView)
    * callback      <- (dialogView)     Generic Response

    * Present       -> (listView)
    * callback      <- (listView)       Generic Response

    * Present       -> (modelListView)
    * callback      <- (modelListView)  Update Multiple Model Changes

    * Present       -> (modelView)
    * callback      <- (modelView)      Update Single Model Changes

## Project Root
+ **/bin** tequila command line interface
+ **/lib** tequila library source code
+ [**/test-spec**](test-spec/README.md) Tequila Specifications, Documentation, Unit Tests, Integration Tests & Regression Tests
