const tools = require("./tools");
const workspace = require("./workspace");


function list_schemes(){
  // return schemes of this workspace
  tools.exec("xcodebuild -list -workspace " + workspace.workspaceName, {cwd: workspace.projectRoot}).then(
    response => {
      tools.log(response.stdout);
    }
  ).catch(
    error => {
      tools.log(error.stderr)
    }
  )
}

function list_targets() {
  // return targets of this workspace
}

function list_destination() {
  // xcodebuild -showdestinations -workspace foo.xcworkspace -scheme foo-Example
}


