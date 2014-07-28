/**
 * tequila
 * framework7-interface-navbar
 */

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