/*
list emulators:
xcrun simctl list

boot an emulator:
xcrun simctl boot <device_name>

install app:
xcrun simctl install <device_name> <path/to/dot.app>

launch app:
xcrun simctl launch 'iPhone 8' org.cocoapods.demo.foo-Example

shutdown emualtor:
xcrun simctl shutdown 'iPhone 8'

*/

const tools = require("./tools")
const bplist = require('bplist-parser')
const util = require("util");
const parseFile = util.promisify(bplist.parseFile);

async function list_emulators(projectRoot){
  try{
    var emulators = []
    var response = await tools.exec("xcrun simctl list", {cwd: projectRoot})
    var device_start = false
    var device_end = false
    response.stdout.split('\n').forEach(line => {
      if(line.trim() === '== Devices =='){
        device_start = true;
        return
      }
      if(device_start && !device_end){
        if(line.includes("==")){
          device_end = true;
          return;
        }
        if(!line.includes("--")){
          tools.log(line.trim());
          emulators.push(line.trim())
        }
      }
    })
    return emulators;
  } catch(e){
    tools.info(e)
  }
}


async function bootDevice(projectRoot, deviceName){
  // xcrun simctl boot <device_name>
  try{
    var response = await tools.exec("xcrun simctl boot " + deviceName, {cwd: projectRoot});
  } catch(e){
    tools.info(e.stderr);
  }
}

async function installApp(projectRoot, deviceName, appPath) {
  // xcrun simctl install <device_name> <path/to/dot.app>
  try{
    tools.info("installing: " + appPath);
    var response = await tools.exec("xcrun simctl install " + deviceName + " " + appPath, {cwd: projectRoot});
  } catch(e){
    tools.info(e.stderr);
  }
}

async function getBundleId(appPath){
  try{
    var response = await parseFile(appPath + "/Info.plist")
    var appIdentifier = response[0].CFBundleIdentifier;
    tools.info(appIdentifier);
    return appIdentifier;
  } catch(e){
    tools.info(e);
  }
}

async function launchApp(projectRoot, deviceName, appPath){
  var simpleName = "'" + deviceName.split("(")[0].trim() + "'"
  //1. boot device
  try{
    await bootDevice(projectRoot, simpleName);
  }catch(e){
    tools.info(e)
  }
  //2. install app
  try{
    await installApp(projectRoot, simpleName, appPath);
  } catch(e) {
    tools.info(e)
  }
  //3. parse bundleId from appPath 
  try{
    var bundleId = await getBundleId(projectRoot + "/" + appPath);
  } catch(e) {
    tools.info(e)
  }
  //4. launch app
  //xcrun simctl launch <device_name> <bundle_id>
  try{
    var cmd = "xcrun simctl launch " + simpleName + " " + bundleId;
    tools.log(cmd)
    var response = await tools.exec(cmd, {cwd: projectRoot});
    tools.log(response.stdout);
  } catch(e){
    tools.info(e.stderr);
  }
}

module.exports = {
  list_emulators,
  launchApp
}