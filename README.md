#tequila
Tequila es bueno!

TODO:

* make filter work in getList

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

INTERFACE DESIGN

* getApplicationStructure -- returns object with app structure

* execute

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
