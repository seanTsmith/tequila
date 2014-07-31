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
  this.pageHandlers = []; // forc lib change
  this.eleCount = 1;
  this.presentation = presentation;

  // Register Pages
  var deviceIcon = 'fa-desktop';
  if (bowser.mobile) deviceIcon = 'fa-mobile';
  if (bowser.tablet) deviceIcon = 'fa-tablet';
  this.addPageHandler('Device', deviceIcon);
  this.addPageHandler('fa-tablet','fa-tablet');
  this.addPageHandler('fa-mobile','fa-mobile');
  this.addPageHandler('fa-desktop','fa-desktop');

  // Initialize vendor lib
  this.f7 = new Framework7();

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

  // TODO this works with or without this code (research f7 need?_
//  // Add view (Is this needed ?)
//  this.f7.addView('.view-main', {
//    // Because we use fixed-through navbar we can enable dynamic navbar
//    dynamicNavbar: true
//  });

  // Main sections for primary UX
  this.renderNavBar();  // Title / back and some options
  this.renderPages();   // Content based on toolbar selected
  this.renderToolBar(); // Changes pages when icon selected

};
