/**
 * tequila
 * framework7-interface-toolbar
 */

// -------------------------------------------------------------------------------------------------------------------
// Render Toolbar (On Bottom)
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.renderToolBar = function () {

  var i;

  // F7 toolbar
  this.toolBar = document.createElement("div");
  this.toolBar.id = "toolBar";
  this.toolBar.className = "toolbar tabbar tabbar-labels";
  this.viewMain.appendChild(this.toolBar);

  // F7 toolbar-inner
  this.toolBarInner = document.createElement("div");
  this.toolBarInner.id = "toolBarInner";
  this.toolBarInner.className = "toolbar-inner";
  this.toolBar.appendChild(this.toolBarInner);

  // Here are the tabs to display
  // Will create one for each IndexTabPage that has been created
  this.toolBarTabs = [];

  // determine max icons that can fit
  var iconMaxFit = 6;
  var baseIconWidth = 64;
  if (this.toolBar.clientWidth > 400) baseIconWidth = 96;
  if (this.toolBar.clientWidth > 768) baseIconWidth = 112;
  if (this.toolBar.clientWidth) {
    iconMaxFit = Math.floor(this.toolBar.clientWidth / baseIconWidth)
  }

  var needMore = (this.indexTabPages.length > iconMaxFit);
  var iconsShowing = needMore ? iconMaxFit : this.indexTabPages.length;

  // Need to track what is shown for when more page rendered
  for (i = 0; i < this.indexTabPages.length; i++)
    this.indexTabPages[i].iconShowing = false;

  for (i = 1; i < iconsShowing; i++) {
    this.addToolBarLink(this.indexTabPages[i].shortcutText, this.indexTabPages[i].shortcutIcon, this.indexTabPages[i].div.id);
    this.indexTabPages[i].iconShowing = true;
  }
  if (needMore) {
    this.addToolBarLink(this.indexTabPages[0].shortcutText, this.indexTabPages[0].shortcutIcon, this.indexTabPages[0].div.id);
    this.indexTabPages[0].iconShowing = true;
  }

  // Now render the more page with unused icons
  this.pageHandlers[0].callback(this, this.indexTabPages[0].div);

};

// -------------------------------------------------------------------------------------------------------------------
// Add a link to toolbar
// -------------------------------------------------------------------------------------------------------------------
Framework7Interface.prototype.addToolBarLink = function (text, icon, id) {

  var tab = document.createElement("a");
  tab.href = "#" + id;
  tab.className = "tab-link";
  tab.innerHTML = '<i class="fa ' + icon + ' fa-lg"></i><span class="tabbar-label tabbar-label-fix">' + text + '</span>';
  this.toolBarInner.appendChild(tab);
  this.toolBarTabs.push(tab);
};
