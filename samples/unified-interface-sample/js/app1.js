/**
 * tequila
 * app
 */

var app;

// If unable to start app ... or any uncaught exceptions in app ?
function critLoadError(err) {
  var myError = '<div style="margin: 8px; padding 4px;">';
  if (err instanceof Error) {
    var trace = printStackTrace({guess: false});
    myError += '<h2>Critical Error loading page</h2>';
    myError += '<CODE>\n';
    myError += '<h3>' + err.message + '</h3>\n';
    for (var i = 0; i < trace.length; i++) {
      var line = trace[i].split('@');
      myError += line[1] + '</br>\n';
    }
    myError += '</CODE>';
  } else if (!err) {
    myError += '<h1>Unknown Error loading page!</h1>';
  } else {
    myError += '<h3>Cryptic Error loading page: ' + err.toString() + '</h3>';
  }
  myError += '</DIV>';
  console.log(myError);
  document.body.innerHTML = myError;
  console.error('ABANDON SHIP');
}

try {
  app = new Application();
  app.set('brand', 'tequila');

  var io;
  if (Framework7Interface.prototype.renderFramework)
    io = new Framework7Interface({name: 'Framework7Interface'});
  else
    io = new Bootstrap3PanelInterface({name: 'Bootstrap3PanelInterface'});
  app.setInterface(io);

// About App
  var aboutPresentation = new Presentation();
  aboutPresentation.set('contents', ['#Ap1\n\nBasic App' ]);
  var aboutCommand = new Command({name: 'About', type: 'Presentation', contents: aboutPresentation});

  var publicMenu = new Presentation();
  publicMenu.set('name', 'Public Menu');
  publicMenu.set('contents', [
    aboutCommand
  ]);

//  app.setPresentation(publicMenu);
  app.setSystemPresentation(publicMenu);

  $(document).ready(function () {
    try {
      app.start(function (stuff) {
        console.log('app got stuff: ' + JSON.stringify(stuff));
      });
    } catch (e) {
      critLoadError(e);
    }
  });

} catch (e) {
  critLoadError(e);
}