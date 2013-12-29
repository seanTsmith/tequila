/**
 * tequila
 * bootstrap3-panels-interface-presentation-panel
 */

// -------------------------------------------------------------------------------------------------------------------
// Panel Handler: presentation
// -------------------------------------------------------------------------------------------------------------------

Bootstrap3PanelInterface.prototype.registerPresentationPanel = function (self, panelBody, panelTitle, action) {

  // Get the presentation contents
  var contents = action.request.command.contents.get('contents');
//  panelBody.innerHTML = '<div class="well-fucking-well">' +
//    '<h1>' + action.request.command.name + ' Command</h1>' +
//    '<p>This is a presentation...</p><br>' +
//    '<p>' + JSON.stringify(contents,'') + '</p>' +
//    '</div>';

  var snips = '';
  for (var i = 1; i <= 10; i++) {
    var classy = 'col-sm-' + i + '';
    var snip = '<div class="form-group has-error">' +
      '<label for="txtAddress" class="col-sm-2 control-label">' + classy + '</label>' +
      '<div class="' + classy + '">' +
      '<input type="text" class="form-control" placeholder="01234567890123456789012345678901234567890123456789012345678901234567890123456789">' +
      '<span class="help-block">Suck it mofo</span>' +
      '</div>' +
      '</div>';

    snips += snip;
  }


//  <div id="txtNameGroup" class="form-group">
//    <label for="txtName" class="col-lg-3 control-label">Name</label>
//
//    <div class="col-lg-7">
//      <input id="txtName" type="text" class="form-control" placeholder="First & Last Name" required>
//        <span id="txtNameHelp" style="display: none;" class="help-block">Name is required.</span>
//      </div>
//    </div>


  panelBody.innerHTML = '<div class="well-fucking-well">' +
    '<form id="submitMember" class="form-horizontal">' +
    '' +
    '<br>' + // todo better margin control instead of this ... (so more responsive)
    '' +
    snips +
    '' +
    '</form>' +
    '</div>';

//<form id="submitMember" class="form-horizontal">


  return true;
};
