const tools = require("./tools");

async function list_schemes(workspaceName, projectRoot) {
  // return schemes of this workspace
  tools.log(workspaceName + " schemes: ")
  var schemes = []
  try {
    var response = await tools.exec("xcodebuild -list -workspace " + workspaceName, { cwd: projectRoot })
    var scheme_start = false;
    var scheme_end = false;
    response.stdout.split('\n').forEach(line => {
      if(scheme_end) return;
      if(!scheme_start && line.trim() === "Schemes:") {
        scheme_start = true
        return
      }
      if(scheme_start){
        if (line.trim() === "") scheme_end = true;
        else{
          console.log("- " + line.trim());
          schemes.push(line.trim())
        }
      }
    })
    return schemes;
  }
  catch (e) {
    tools.log(e.stderr)
  }
}

function list_targets() {
  // return targets of this workspace
}

async function list_destination(workspaceName, projectRoot, schemeName) {
  // xcodebuild -showdestinations -workspace foo.xcworkspace -scheme foo-Example
  try{
    var response = await tools.exec("xcodebuild -showdestinations -workspace " + workspaceName + " -scheme " + schemeName,
      {cwd: projectRoot});
    // tools.log(response.stdout);
    var des_start = false;
    var des_end = false;
    var destinations = [];
    // 'platform=iOS Simulator,name=iPhone 6 Plus,OS=9.1'
    response.stdout.split('\n').forEach(line => {
      if(line.includes("Available destinations")) {
        des_start = true;
        return;
      }
      if(des_start && line.trim() === ""){
        des_end = true;
        return;
      }
      if (des_start && !des_end) {
        var os = line.split(',')[2].split(':')[1];
        var name = line.split(',')[3].split(':')[1].split("}")[0].trim();
        var des = "'platform=iOS Simulator,name=" + name + ",OS=" + os + "'"
        tools.info(des)
        destinations.push(des)
      }
    })
    return destinations;
  } catch(e){
    tools.log(e);
  }
}

module.exports = {
  list_schemes,
  list_destination,
  list_targets
}
