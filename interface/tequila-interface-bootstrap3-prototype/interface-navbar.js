/**
 * tequila
 * interface-navbar
 */

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
  myInterface.navBarBrand.innerHTML = '<a href="javascript:myInterface.navPicked(\'tequila.js\')">' + 'tequila.js' + '</a>';
  myInterface.navResponsiveHeader.appendChild(myInterface.navBarBrand);

//  <li class="active"><a style="display: block; text-align: center;" href="javascript:loadStore()">TRY AGAIN</a></li>


  // Collapsible navbar
  myInterface.collapsibleNavBar = document.createElement("div");
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


  // login right justified
  myInterface.navListRight = document.createElement("ul");
  myInterface.navListRight.id = "navListRight";
  myInterface.navListRight.className = "nav navbar-nav navbar-right";
  myInterface.collapsibleNavBar.appendChild(myInterface.navListRight);

  myInterface.user = myInterface.renderNavBarListMenu(myInterface.navListRight, 'Clark Kent');
  myInterface.renderNavBarListItem(myInterface.user, 'Logout', 'glyphicon-log-out');

  // Search right justified
  myInterface.navSearch = document.createElement("form");
  myInterface.navSearch.className = "navbar-form navbar-right";
  myInterface.navSearch.innerHTML = '<div class="form-group">' +
    '<input type="text" class="form-control" placeholder="Search"></div>' +
    '<a type="button" href="javascript:myInterface.navPicked(\'Search\')" class="btn btn-default"><span class="glyphicon glyphicon-search"></span></a>';
  myInterface.collapsibleNavBar.appendChild(myInterface.navSearch);

};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
myInterface.navPicked = function (name) {
  myInterface.renderPanel(name, 'default');
};

// -------------------------------------------------------------------------------------------------------------------
// Render NavBar List Item
// -------------------------------------------------------------------------------------------------------------------
myInterface.renderNavBarListItem = function (parent, name, glyph) {
  var listItem = document.createElement('li');
  console.log(parent + ' ' + name)
  if (glyph) {
    listItem.innerHTML = '<a href="javascript:myInterface.navPicked(\'' + name + '\')">' +
      '<span class="glyphicon ' + glyph + '"></span> ' +
      '' + name + '</a>';
  } else {
    listItem.innerHTML = '<a href="javascript:myInterface.navPicked(\'' + name + '\')">' + name + '</a>';
  }
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
