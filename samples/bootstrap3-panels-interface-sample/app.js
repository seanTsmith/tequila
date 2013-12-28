/**
 * tequila
 * app
 */

var app = new Application();
app.set('brand', 'tequila sample app');

var b3p = new Bootstrap3PanelInterface();
app.setInterface(b3p);

// App menu
var menu = new Presentation();
menu.set('name', 'Main Menu');
menu.set('contents', [
  new Command({name: 'Stooges', type: 'Menu', contents: [
    'The Three Stooges',
    '-',
    new Command({name: 'Moe'}),
    new Command({name: 'Larry'}),
    new Command({name: 'Curly'})
  ]}),
  new Command({name: 'Commands', type: 'Menu', contents: [
    'Command Types',
    '-',
    new Command({name: 'Stub', type: 'Stub'}),
    new Command({name: 'Presentation', type: 'Presentation', contents: new Presentation()}),
    new Command({name: 'Function', type: 'Function', contents: function(){
      alert("Hello! I am an alert box!!");
    }}),
    new Command({name: 'Procedure', type: 'Procedure', contents: new Procedure()})
  ]})
]);
app.setPresentation(menu);

$(document).ready(function () {
  app.start(function (stuff) {
    console.log('app got stuff: ' + JSON.stringify(stuff));
  });
  b3p.mockRequest(new Request('dude'));
});
