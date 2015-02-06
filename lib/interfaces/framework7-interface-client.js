/**
 * tequila
 * framework7-interface-client
 */
/*
 * Methods(Client Side Only) testing git stuff
 */

// -------------------------------------------------------------------------------------------------------------------
// start interface
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.start = function (application, presentation, toolbarPresentation, callBack) {
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('AppPresentation required');
  if (!(toolbarPresentation instanceof Presentation)) throw new Error('toolbarPresentation required');
  if (typeof callBack != 'function') throw new Error('callBack required');
  this.startCallback = callBack;

  // Stuff we care about
  this.pageHandlers = []; // force lib change
  this.eleCount = 1;
  this.presentation = presentation;
  this.toolbarPresentation = toolbarPresentation;

  // Register Pages

  this.addPageHandler('More','fa-ellipsis-h',Framework7Interface.prototype.registerMorePage);  // More is first tab page always!

  this.addPageHandler('App', 'fa-th', Framework7Interface.prototype.registerAppPage);
  var deviceIcon = 'fa-desktop';
  if (bowser.mobile) deviceIcon = 'fa-mobile';
  if (bowser.tablet) deviceIcon = 'fa-tablet';
  this.addPageHandler('Device', deviceIcon, Framework7Interface.prototype.registerDevicePage);
  if (this.startCallback) { // TODO Crap code wtf design this shit properly
    this.startCallback('loadPages');
  }
//  this.addPageHandler('fa-ruble','fa-ruble');
//  this.addPageHandler('fa-won','fa-won');
//  this.addPageHandler('fa-bitcoin','fa-bitcoin');
//  this.addPageHandler('fa-file','fa-file');
//  this.addPageHandler('fa-sort','fa-sort');
//  this.addPageHandler('fa-xing','fa-xing');
//  this.addPageHandler('fa-youtube','fa-youtube');
//  this.addPageHandler('fa-dropbox','fa-dropbox');
//  this.addPageHandler('fa-instagram','fa-instagram');
//  this.addPageHandler('fa-flickr','fa-flickr');
//  this.addPageHandler('fa-adn','fa-adn');
//  this.addPageHandler('fa-wheelchair','fa-wheelchair');
//  this.addPageHandler('fa-envelope','fa-envelope');
//  this.addPageHandler('fa-share','fa-share');
//  this.addPageHandler('fa-bomb','fa-bomb');

  // Initialize vendor lib
  this.f7 = new Framework7();

  // Create html elements for framework
  this.renderFramework();
  this.selectPage('App');

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }
};

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderFramework = function () {

  var self = this;

  // For F7
  document.body.innerHTML = '' +
  '<div class="statusbar-overlay"></div>' + // Status bar overlay for full screen mode (PhoneGap)
  '<div class="panel-overlay"></div>'; // Panels overlay

  // F7 Views Div
  this.views = document.createElement("div");
  this.views.id = "views";
  this.views.className = "views";
  document.body.appendChild(this.views);

  // Tell F7 this is the main view
  this.viewMain = document.createElement("div");
  this.viewMain.id = "viewMain";
  this.viewMain.className = "view view-main";
  this.views.appendChild(this.viewMain);

  // Main sections for primary UI
  this.renderNavBar();  // Title / back and some options
  this.renderPages();   // Content based on toolbar selected
  this.renderToolBar(); // Changes pages when icon selected

  // f7 thingy
  this.f7mainView = this.f7.addView('.view-main', {
    dynamicNavbar: true
  });

  // put toolbar back when on main index view
  this.f7.onPageBeforeAnimation('index',function(page){
    self.f7mainView.showToolbar();
  })

};

// -------------------------------------------------------------------------------------------------------------------
// Dispatch request
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.dispatch = function (request, response) {
  var style = null;
  var icon = null;
  var name = null;
  if (false === (request instanceof Request)) throw new Error('Request required');
  if (response && typeof response != 'function') throw new Error('response callback is not a function');
  if (!this.application || !this.application.dispatch(request)) { // todo application not defined ? review design on this interface / app relationship
    if (request.type == 'Command') {
      style = request.command.theme;
      icon = request.command.icon;
      name = request.command.name;

      var doRenderPanel = true;

      // See if panel already
      for (var panel in this.panels) {
        if (this.panels.hasOwnProperty(panel)) {
          if (name == this.panels[panel].label) {
            doRenderPanel = false;
          }
        }
      }

      if (doRenderPanel && request.command.type == 'Stub') {
        this.addStubPage(request.command);
        //console.log('be stub');
//        this.renderPanel({label: name, type: 'stub', style: style || 'info', icon: icon || 'fa-square-o', request: request});
        return;
      }
      if (doRenderPanel && request.command.type == 'Presentation') {
        if (!(request.command.contents instanceof Presentation)) throw new Error('contents must be a Presentation');
        var errors = request.command.contents.getObjectStateErrors();
        if (errors.length)
          if (errors.length > 1) throw new Error('error executing Presentation: multiple errors');
        if (errors.length) throw new Error('error executing Presentation: ' + errors[0]);
//        this.renderPanel({label: name, type: 'presentation', style: style || 'info', icon: icon || 'fa-building', request: request});
//        console.log('renderPanel');
        this.addPresentationPage(request.command);
        return;
      }
      if (this.startCallback) {
//        console.log('startCallback');
        this.startCallback(request);
      }
    }
  }
};