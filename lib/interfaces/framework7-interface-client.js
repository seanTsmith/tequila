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
  this.pageHandlers = []; // force lib change
  this.eleCount = 1;
  this.presentation = presentation;

  // Register Pages

  this.addPageHandler('More','fa-ellipsis-h',Framework7Interface.prototype.registerMorePage);  // More is first tab page always!
  this.addPageHandler('App', 'fa-th', Framework7Interface.prototype.registerAppPage);

  var deviceIcon = 'fa-desktop';
  if (bowser.mobile) deviceIcon = 'fa-mobile';
  if (bowser.tablet) deviceIcon = 'fa-tablet';
  this.addPageHandler('Device', deviceIcon, Framework7Interface.prototype.registerDevicePage);

  this.addPageHandler('fa-ruble','fa-ruble');
  this.addPageHandler('fa-won','fa-won');
  this.addPageHandler('fa-bitcoin','fa-bitcoin');
  this.addPageHandler('fa-file','fa-file');
  this.addPageHandler('fa-sort','fa-sort');
  this.addPageHandler('fa-xing','fa-xing');
  this.addPageHandler('fa-youtube','fa-youtube');
  this.addPageHandler('fa-dropbox','fa-dropbox');
  this.addPageHandler('fa-instagram','fa-instagram');
  this.addPageHandler('fa-flickr','fa-flickr');
  this.addPageHandler('fa-adn','fa-adn');
  this.addPageHandler('fa-wheelchair','fa-wheelchair');
  this.addPageHandler('fa-envelope','fa-envelope');
  this.addPageHandler('fa-share','fa-share');
  this.addPageHandler('fa-bomb','fa-bomb');

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

  // TODO this works with or without this code (research f7 need?)
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
