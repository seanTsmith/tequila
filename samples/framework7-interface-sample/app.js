/**
 * tequila
 * app
 */

var sample = {};
var app = new Application();
app.set('brand', 'tequila');

sample.InitializeStore = function (store, callback) {
  var cmd = new Command({name: 'cmdInitializeStore', type: 'Procedure', contents: new Procedure({tasks: [
    function () {
      var self = this;
      var user = new User();
      user.set('name', 'admin');
      user.set('password', 'tequila');
      store.putModel(user, function (model, error) {
        if (error) throw error;
        self.complete();
      });
    } // add more to array here ...
  ]})});
  cmd.onEvent('*', function (event) {
    if (event == 'Error') {
      cmd.gotErrors = true;
      callback(new Error('InitializeStore failed'));
    }
    if (event == 'Completed') {
      if (!cmd.gotErrors)
        callback();
    }
  });
  cmd.execute();
};

var f7 = new Framework7Interface({name:'Framework7Interface'});
app.setInterface(f7);


// Quickbooks Menu for kicks
/***
 *  Company
 *    Customer Center
 *    Create Invoices
 *    Enter Sales Receipts
 *    Create Estimates
 *    Create Credit Memos/Refunds
 *    Enter Statement Charges
 *    Create Statements
 *    Assess Finance Charges
 *    Receive Payments
 *    Item List
 *  Customers
 *  Vendors
 *  Employees
 *  Banking
 ***/
var quickBooks = new Command({name: 'QuickBooks', type: 'Menu', contents: [
  new Command({name: 'Company', type: 'Menu', contents: [
    new Command({name: 'xxxx'}),
    new Command({name: 'xxxx'})
  ]}),
  new Command({name: 'Customers', type: 'Menu', contents: [
    new Command({name: 'Customer Center'}),
    new Command({name: 'Create Invoices'}),
    new Command({name: 'Enter Sales Receipts'}),
    new Command({name: 'Create Estimates'}),
    new Command({name: 'Create Credit Memos/Refunds'}),
    new Command({name: 'Enter Statement Charges'}),
    new Command({name: 'Create Statements'}),
    new Command({name: 'Assess Finance Charges'}),
    new Command({name: 'Receive Payments'}),
    new Command({name: 'Item List'})
  ]}),
  new Command({name: 'Vendors', type: 'Menu', contents: [
    new Command({name: 'xxxx'}),
    new Command({name: 'xxxx'})
  ]}),
  new Command({name: 'Employees', type: 'Menu', contents: [
    new Command({name: 'xxxx'}),
    new Command({name: 'xxxx'})
  ]}),
  new Command({name: 'Banking', type: 'Menu', contents: [
    new Command({name: 'xxxx'}),
    new Command({name: 'xxxx'})
  ]})
]});

// Stub commands
var stubVerbose = new Command({name: 'Verbose Name here is it man! Like you wanted!!!', description: 'Moses Horwitz', theme: 'warning', icon: 'fa-coffee'});
var stubMoe = new Command({name: 'Moe', description: 'Moses Horwitz', theme: 'primary', icon: 'fa-coffee'});
var stubLarry = new Command({name: 'Larry', description: 'Louis Fienberg', theme: 'info', icon: 'fa-beer'});
var stubCurly = new Command({name: 'Curly', description: 'Jerome Lester Horwitz', theme: 'warning', icon: 'fa-glass'});

// Create a function command
var funcCommand = new Command({name: 'Function', type: 'Function', contents: function () {
  alert("Hello! I am an alert box!!");
}});

// Create a procedure command
var procCommand = new Command({name: 'Procedure', type: 'Procedure', contents: new Procedure()});

// Create sample presentation
var pres = new Presentation();
pres.set('contents', [
  '###INSTRUCTIONS\nEnter some stuff then push some buttons.',
  '-',
  new Attribute({name: 'firstName', label: 'First Name', type: 'String(20)', value: 'John'}),
  new Attribute({name: 'lastName', label: 'Last Name', type: 'String(25)', value: 'Doe'}),
  new Attribute({name: 'address', label: 'Address', type: 'String(50)'}),
  new Attribute({name: 'city', label: 'City', type: 'String(35)'}),
  new Attribute({name: 'state', label: 'State', type: 'String(2)'}),
  new Attribute({name: 'zip', label: 'Zip Code', type: 'String(10)', placeHolder: '#####-####'}),
  '###More stuff',
  new Attribute({name: 'password', label: 'Password', type: 'String(20)', hint: {password: true}}),
  new Attribute({name: 'birthDate', label: 'Birth Date', type: 'Date', value: new Date()}),
  new Attribute({name: 'drink', type: 'String(25)', quickPick: ['Water', 'Coke', 'Coffee']}),
  new Attribute({name: 'sex', type: 'Boolean', value: true}),
  new Attribute({name: 'drugs', type: 'Boolean', value: false}),
  new Attribute({name: 'IQ', type: 'Number', value: 100}),
  '-',
  funcCommand,
  procCommand,
  stubMoe,
  stubLarry,
  stubCurly

]);
var presCommand = new Command({name: 'Presentation', type: 'Presentation', contents: pres});

// About App
var aboutPresentation = new Presentation();
aboutPresentation.set('contents', [
    '####ABOUT TEQUILA\n\n' +
    'Tequila is a distilled beverage made from the blue agave plant, primarily in the area surrounding the city of ' +
    'Tequila, 65 km northwest of Guadalajara, and in the highlands of the north western Mexican state of Jalisco.\n\n' +
    JSON.stringify(bowser, null, '\t')
]);
var aboutCommand = new Command({name: 'About', type: 'Presentation', contents: aboutPresentation});

// App menu
var privateMenu = new Presentation();
privateMenu.set('name', 'Private Menu');
privateMenu.set('contents', [
//  stubVerbose,
  quickBooks,
  new Command({name: 'Stooges', type: 'Menu', contents: [
    'The Three Stooges',
    '-',
    stubMoe,
    stubLarry,
    stubCurly
  ]}),
  new Command({name: 'Commands', type: 'Menu', contents: [
    'Command Types',
    '-',
    new Command({name: 'Stub', type: 'Stub'}),
    new Command({name: 'Menu', type: 'Menu', contents: [
      'Soup du jour'
    ]}),
    presCommand,
    funcCommand,
    procCommand
  ]}),
  aboutCommand
]);

var storePicks = ['MemoryStore', 'LocalStore', 'HostStore'];
var loginPresentation = new Presentation();
loginPresentation.set('contents', [
  'Please login to see the fun stuff.',
  '-',
  new Attribute({name: 'login', label: 'Login', type: 'String(20)', hint: {required: true}, value: ''}),
  new Attribute({name: 'password', label: 'Password', type: 'String(20)', hint: {password: true}, value: ''}),
  new Attribute({name: 'store', label: 'Store', type: 'String', quickPick: storePicks, value: '(memory store)'}),
  '-',
  new Command({name: 'Login', type: 'Function', theme: 'info', icon: 'fa-sign-in', contents: function () {
    loginPresentation.validate(function () {
      if (!loginPresentation.validationMessage) {
        $("#panel1").show(); // todo don't hard code ?
        app.setPresentation(privateMenu);
      }
    });
  }})
]);

var loginCommand = new Command({name: 'Login', type: 'Presentation', contents: loginPresentation});
var publicMenu = new Presentation();
publicMenu.set('name', 'Public Menu');
publicMenu.set('contents', [
  aboutCommand,
  '-', // separator right justifies remainder
  loginCommand
]);

app.setPresentation(privateMenu);
//app.setSystemPresentation(privateMenu); // TODO just to fix start error

$(document).ready(function () {
  sample.memoryStore = new MemoryStore();
  sample.InitializeStore(sample.memoryStore, function (err) {
    if (err) {
//      var con = aboutPresentation.get('contents');
//      con.unshift('-');
//      con.unshift('####' + err);
//      con.unshift('#**ERROR**');
//      aboutPresentation.set('contents', con);
    }
    app.start(function (stuff) {
      console.log('app got stuff: ' + JSON.stringify(stuff));
    });
//    f7.mockRequest(new Request({type: 'Command', command: presCommand}));
  });
});
