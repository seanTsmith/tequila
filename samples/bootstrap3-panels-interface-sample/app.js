/**
 * tequila
 * app
 */

var app = new Application();
app.set('brand', 'tequila');

var b3p = new Bootstrap3PanelInterface();
app.setInterface(b3p);

// Stub commands
var stubMoe = new Command({name: 'Moe', description: 'Moses Horwitz', theme: 'primary', icon: 'fa-coffee'});
var stubLarry = new Command({name: 'Larry', description: 'Louis Fienberg', theme: 'info', icon: 'fa-beer'});
var stubCurly = new Command({name: 'Curly', description: 'Jerome Lester Horwitz', theme: 'warning', icon: 'fa-glass'});

// Create a function command
var funcCommand = new Command({name: 'Function', type: 'Function', contents: function () {
  alert("Hello! I am an alert box!!");
}});

// Create a procedure command
procCommand = new Command({name: 'Procedure', type: 'Procedure', contents: new Procedure()});

// Create sample presentation
var pres = new Presentation();
pres.set('contents', [
  '####INSTRUCTIONS\n\n' +
    'Enter some stuff then push some buttons.',
  '-',
  new Attribute({name: 'firstName', label: 'First Name', type: 'String(20)', value: 'John'}),
  new Attribute({name: 'lastName', label: 'Last Name', type: 'String(25)', value: 'Doe'}),
  new Attribute({name: 'address', label: 'Address', type: 'String(50)'}),
  new Attribute({name: 'city', label: 'City', type: 'String(35)'}),
  new Attribute({name: 'state', label: 'State', type: 'String(2)'}),
  new Attribute({name: 'zip', label: 'Zip Code', type: 'String(10)', placeholder: '#####-####'}),
  '-',
  funcCommand,
  procCommand,
  stubMoe,
  stubLarry,
  stubCurly

]);
var presCommand = new Command({name: 'Presentation', type: 'Presentation', contents: pres});

// App menu
var privateMenu = new Presentation();
privateMenu.set('name', 'Private Menu');
privateMenu.set('contents', [
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
    presCommand,
    funcCommand,
    procCommand
  ]})
]);

// Here is App when not logged in
var about = new Presentation();
about.set('contents', [
  '####ABOUT TEQUILA\n\n' +
    'Tequila is a distilled beverage made from the blue agave plant, primarily in the area surrounding the city of ' +
    'Tequila, 65 km northwest of Guadalajara, and in the highlands of the north western Mexican state of Jalisco.'
]);
var aboutCommand = new Command({name: 'About', type: 'Presentation', contents: about});

var login = new Presentation();
login.set('contents', [
  'Please login to see the fun stuff.',
  '-',
  new Attribute({name: 'login', label: 'Login', type: 'String(20)', value: ''}),
  new Attribute({name: 'password', label: 'Password', type: 'String(20)', value: ''}),
  '-',
  new Command({name: 'Login', type: 'Function', theme: 'info', icon: 'fa-sign-in', contents: function () {
    $("#panel1").show(); // todo dont hard code ?
    app.setPresentation(privateMenu);
  }})

]);

var loginCommand = new Command({name: 'Login', type: 'Presentation', contents: login});
var publicMenu = new Presentation();
publicMenu.set('name', 'Public Menu');
publicMenu.set('contents', [
  aboutCommand,
  loginCommand
]);

app.setPresentation(publicMenu);

$(document).ready(function () {
  app.start(function (stuff) {
    console.log('app got stuff: ' + JSON.stringify(stuff));
  });
//  b3p.mockRequest(new Request({type: 'Command', command: presCommand}));
});
