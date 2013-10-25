/**
 * myInterface.js
 */

myInterface = {};

// -------------------------------------------------------------------------------------------------------------------
// Entry point when document ready
// -------------------------------------------------------------------------------------------------------------------
$(document).ready(function () {

  // Create html elements for framework
  myInterface.renderFramework();

  // Remover loading panel
  try {
    var loadingPanel = document.getElementById("loadingPanel");
    loadingPanel.parentNode.removeChild(loadingPanel);
  } catch (e) {
  }

});

// -------------------------------------------------------------------------------------------------------------------
// Render Framework
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderFramework = function () {
  myInterface.renderNavBar();
  myInterface.renderPanel('Panel type default','default');
  myInterface.renderPanel('Panel type primary','primary');
  myInterface.renderPanel('Panel type success','success');
  myInterface.renderPanel('Panel type info','info');
  myInterface.renderPanel('Panel type warning','warning');
  myInterface.renderPanel('Panel type danger','danger');
};

// -------------------------------------------------------------------------------------------------------------------
// Render Panel
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderPanel = function (name, panelType /* default primary success info warning danger */) {

  panelType = panelType || "default"

  // Container so bootstrap centers
  if (!myInterface.panelContainer) {
    myInterface.panelContainer = document.createElement("div");
    myInterface.panelContainer.id = "panelContainer";
    myInterface.panelContainer.className = "container";
    document.body.appendChild(myInterface.panelContainer);
  }


  var newPanel = document.createElement("div");
  newPanel.className = "panel panel-"+panelType;
  myInterface.panelContainer.appendChild(newPanel);

  var panelHeading = document.createElement("div");
  panelHeading.className = "panel-heading";
  // panelHeading.innerHTML = name;
  newPanel.appendChild(panelHeading);

  var paneTitle = document.createElement("h3");
  paneTitle.className = "panel-title";
  paneTitle.innerHTML = name;
  panelHeading.appendChild(paneTitle);

  var panelBody = document.createElement("div");
  panelBody.className = "panel-body";
  panelBody.innerHTML = 'This is the body of the panel.';
  newPanel.appendChild(panelBody);


};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBar = function () {

  // Main navbar
  myInterface.navBar = document.createElement("header");
  myInterface.navBar.id = "navBar";
  myInterface.navBar.className = "navbar navbar-default navbar-fixed-top";
//  myInterface.navBar.className = "navbar navbar-inverse navbar-fixed-top";
  myInterface.navBar.setAttribute('role', 'banner');
  document.body.appendChild(myInterface.navBar);

  // Add a gap below navbar if not small view -->
  var navBreak = document.createElement("br");
  navBreak.className = "hidden-sm";
  document.body.appendChild(navBreak);
  document.body.appendChild(navBreak);
  document.body.appendChild(navBreak);
  document.body.appendChild(navBreak);
  document.body.appendChild(navBreak);

  //   <br class="hidden-sm">


  // Container so bootstrap centers
  myInterface.navContainer = document.createElement("div");
  myInterface.navContainer.id = "navContainer";
  myInterface.navContainer.className = "container";
  myInterface.navBar.appendChild(myInterface.navContainer);

  // Responsive header
  myInterface.navResponsiveHeader = document.createElement("div");
  myInterface.navResponsiveHeader.id = "navResponsiveHeader";
  myInterface.navResponsiveHeader.className = "navbar-header";
  myInterface.navContainer.appendChild(myInterface.navResponsiveHeader);

  // Navbar toggle button when small presentation
  var iconBar = '<span class="icon-bar"></span>';
  myInterface.navBarToggle = document.createElement("button");
  myInterface.navBarToggle.id = "navBarToggle";
  myInterface.navBarToggle.className = "navbar-toggle";
  myInterface.navBarToggle.setAttribute('type', 'button');
  myInterface.navBarToggle.setAttribute('data-toggle', 'collapse');
  myInterface.navBarToggle.setAttribute('data-target', '.navbar-collapse');
  myInterface.navBarToggle.innerHTML = iconBar + iconBar + iconBar;
  myInterface.navResponsiveHeader.appendChild(myInterface.navBarToggle);

  // Brand
  myInterface.navBarBrand = document.createElement("a");
  myInterface.navBarBrand.id = "navBarBrand";
  myInterface.navBarBrand.className = "navbar-brand";
  myInterface.navBarBrand.innerHTML = '<a href="javascript:alert(\'wtf\')">' + 'tequila.js' + '</a>';
  myInterface.navResponsiveHeader.appendChild(myInterface.navBarBrand);

//  <li class="active"><a style="display: block; text-align: center;" href="javascript:loadStore()">TRY AGAIN</a></li>


  // Collapsible navbar
  myInterface.collapsibleNavBar = document.createElement("nav");
  myInterface.collapsibleNavBar.id = "collapsibleNavBar";
  myInterface.collapsibleNavBar.className = "navbar-collapse collapse";
  myInterface.collapsibleNavBar.setAttribute('role', 'navigation');
  myInterface.navContainer.appendChild(myInterface.collapsibleNavBar);

  // navbar list
  myInterface.navList = document.createElement("ul");
  myInterface.navList.id = "navList";
  myInterface.navList.className = "nav navbar-nav";
  myInterface.collapsibleNavBar.appendChild(myInterface.navList);

  myInterface.stooges = myInterface.renderNavBarListMenu(myInterface.navList, 'Stooges');
  myInterface.renderNavBarListItem(myInterface.stooges, 'Moe');
  myInterface.renderNavBarListItem(myInterface.stooges, 'Larry');
  myInterface.renderNavBarListItem(myInterface.stooges, 'Curly');

  myInterface.fruit = myInterface.renderNavBarListMenu(myInterface.navList, 'Fruit');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Apple');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Banana');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Cherry');
  myInterface.renderNavBarListItem(myInterface.fruit, 'Peach');

  myInterface.superhero = myInterface.renderNavBarListMenu(myInterface.navList, 'Super Heroes');
  myInterface.renderNavBarListItem(myInterface.superhero, 'Superman');
  myInterface.renderNavBarListItem(myInterface.superhero, 'Batman');
  myInterface.renderNavBarListItem(myInterface.superhero, 'Spiderman');

  // fucking with some pull-right shit
  myInterface.cart = document.createElement("a");
  myInterface.cart.setAttribute('type', 'button');
  myInterface.cart.className = "btn btn-default navbar-btn pull-right";
  myInterface.cart.innerHTML = '<span class="glyphicon glyphicon-log-out"></span> logout'
  myInterface.collapsibleNavBar.appendChild(myInterface.cart);


};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
myInterface.navPicked = function (name) {
  console.log('name ' + name);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBarListItem = function (parent, name) {
  var listItem = document.createElement('li');
  console.log(parent + ' ' + name)
  listItem.innerHTML = '<a href="javascript:myInterface.navPicked(\'' + name + '\')">' + name + '</a>';

  // myInterface.navBarBrand.innerHTML = '<a href="javascript:alert(\'wtf\')">' + 'tequila.js' + '</a>';


  parent.appendChild(listItem);
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Menu
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBarListMenu = function (parent, name) {

  var dropDown = document.createElement('li');
  dropDown.className = "dropdown";
  dropDown.innerHTML = '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + name + '<b class="caret"></b></a>'
  parent.appendChild(dropDown);

  var dropDownMenu = document.createElement('ul');
  dropDownMenu.className = "dropdown-menu";
  dropDown.appendChild(dropDownMenu);


  return dropDownMenu;
};








































