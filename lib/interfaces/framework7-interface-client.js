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

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar (On Top)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderNavBar = function () {

  // Top NavBar
  this.navBar = document.createElement("div");
  this.navBar.id = "navBar";
  this.navBar.className = "navbar";
  this.viewMain.appendChild(this.navBar);

  // NavBar Inner
  this.navBarInner = document.createElement("div");
  this.navBarInner.id = "navBarInner";
  this.navBarInner.className = "navbar-inner";
  this.navBar.appendChild(this.navBarInner);

  // Brand
  this.brand = document.createElement("div");
  this.brand.id = "brand";
  this.brand.className = "left sliding";
  this.brand.innerText = app.get('brand');
  this.navBarInner.appendChild(this.brand);

};

// -------------------------------------------------------------------------------------------------------------------
// Render Pages
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderPages = function () {

  // F7 Pages container, because we use fixed-through navbar and toolbar, it has additional appropriate classes
  this.pages = document.createElement("div");
  this.pages.id = "pages";
  this.pages.className = "pages navbar-through toolbar-through";
  this.viewMain.appendChild(this.pages);

  // F7 data-page
  this.dataPage = document.createElement("div");
  this.dataPage.id = "dataPage";
  this.dataPage.className = "page";
  this.dataPage.setAttribute('data-page', 'index');
  this.pages.appendChild(this.dataPage);

  // F7 page-content
  this.pageContent = document.createElement("div");
  this.pageContent.id = "pageContent";
  this.pageContent.className = "page-content";
  this.dataPage.appendChild(this.pageContent);

  // TODO: Next add based on registered pages


};

// -------------------------------------------------------------------------------------------------------------------
// Render Toolbar (On Botton)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderToolBar = function () {

  // F7 toolar
  this.toolBar = document.createElement("div");
  this.toolBar.id = "pages";
  this.toolBar.className = "toolbar tabbar tabbar-labels";
  this.viewMain.appendChild(this.toolBar);

  // F7 toolar-inner
  this.toolBarInner = document.createElement("div");
  this.toolBarInner.id = "toolBarInner";
  this.toolBarInner.className = "toolbar-inner";
  this.toolBar.appendChild(this.toolBarInner);

  // TODO: icons for each page created

};
