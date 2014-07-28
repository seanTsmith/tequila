/**
 * tequila
 * framework7-interface-client
 */
/*
 * Methods(Client Side Only)
 */

// -------------------------------------------------------------------------------------------------------------------
// start interface
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.start = function (application, presentation, callBack) {
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('Presentation required');
  if (typeof callBack != 'function') throw new Error('callBack required');
  this.startCallback = callBack;

  // Stuff we care about
  this.panelHandlers = [];
  this.eleCount = 0;
  this.presentation = presentation;

  // Register Panels
//  this.addPanelHandler('home', this.registerAppBar);
//  this.addPanelHandler('stub', this.registerStubPanel);
//  this.addPanelHandler('presentation', this.registerPresentationPanel);

  // Create html elements for framework
  this.renderFramework();

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }

  // Change background from white in loader
//  document.body.style.backgroundColor = "#e0e0e0";
};

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderFramework = function () {

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

  // Main sections for primary UX
  this.renderNavBar();  // Title / back and some options
  this.renderPages();   // Content based on toolbar selected
  this.renderToolBar(); // Changes pages when icon selected

};
