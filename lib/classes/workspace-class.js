/**
 * tequila
 * workspace-class
 */
function Workspace(user) {
  if (false === (this instanceof Workspace)) throw new Error('new operator required');
  if (false === (user instanceof User)) throw new Error('user model required');
//  if ('undefined' == typeof type) throw new Error('message type required');
//  if (!T.contains(T.getWorkspaceTypes(), type)) throw new Error('Invalid message type: ' + type);
  this.user = user;
  this.deltas = [];
//  this.contents = contents;
}
/*
 * Methods
 */
Workspace.prototype.toString = function () {
  return "unknown user's workspace";
};
