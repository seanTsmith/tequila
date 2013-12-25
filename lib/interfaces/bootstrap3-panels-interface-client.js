/**
 * tequila
 * bootstrap3-panels-interface-client
 */

// -------------------------------------------------------------------------------------------------------------------
// Methods (Client Side Only)
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.start = function (application, presentation, callBack) {
  if (!(application instanceof Application)) throw new Error('Application required');
  if (!(presentation instanceof Presentation)) throw new Error('Presentation required');
  if (typeof callBack != 'function') throw new Error('callback required');
  this.startCallback = callBack;

  // Stuff we care about
  this.panelHandlers = [];
  this.eleCount = 0;
  this.presentation = presentation;

  // Register Panels
  this.addPanelHandler('home', this.registerAppBar);
// Bootstrap3PanelInterface.addPanelHandler('home', function (panelBody, panelTitle) {
// Bootstrap3PanelInterface.prototype.registerAppBar = function (panelBody, panelTitle) {


  // Create html elements for framework
  this.renderFramework();

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }

  // Change background from white in loader
  document.body.style.backgroundColor = "#e0e0e0";
};

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
Bootstrap3PanelInterface.prototype.renderFramework = function () {
  this.renderNavBar();
  this.homePanel();
//  myInterface.renderPageFooter();
//  myInterface.renderPanel({label:'Eat'});
//  myInterface.renderPanel({label:'More'});
//  myInterface.renderPanel({label:'Chiken'});
};