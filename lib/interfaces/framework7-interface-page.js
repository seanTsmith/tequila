/**
 * tequila
 * framework7-interface-page
 */

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