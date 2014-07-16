/**
 * tequila
 * panel-type-options
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: options
// -------------------------------------------------------------------------------------------------------------------
myInterface.addPanelHandler(myInterface.COMMAND.OPTIONS, function (ele) {
  $(ele).addClass("panel-body-no-well");
  ele.innerHTML = '' +
    '<div class="form-group">' +
    '<label>Navigation</label><p class="text-muted">Select navigation panels to display</p>' +
    '<div class="btn-group" data-toggle="buttons">' +
    '<label id="navOptionNavigationNavbar" class="btn btn-default"><input type="radio" name="options"> Navbar </label>' +
    '<label id="navOptionNavigationAppbar" class="btn btn-default"><input type="radio" name="options"> Appbar </label>' +
    '<label id="navOptionNavigationBoth" class="btn btn-default active"><input type="radio" name="options"> Both </label>' +
    '</div>' +
    '</div>'

  $('#navOptionNavigationNavbar').bind('click',function(event){
    $("#panel1").hide();
    $("#navBar").show();
    $("#navBarShunt").show();
  });
  $('#navOptionNavigationAppbar').bind('click',function(event){
    $("#panel1").show();
    $("#navBar").hide();
    $("#navBarShunt").hide();
  });
  $('#navOptionNavigationBoth').bind('click',function(event){
    $("#panel1").show();
    $("#navBar").show();
    $("#navBarShunt").show();
  });
  return true;
});