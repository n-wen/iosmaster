//const path = require("path");
const vscode = require('vscode');
const fs = require("fs");
const tools = require("./tools");
const xcode = require("./xcode");
const simctl = require("./simctl");
const util = require("util");

const readdir = util.promisify(fs.readdir);

// project absolute path
const projectRoot = vscode.workspace.workspaceFolders[0].uri.path;
// used for xcodebuild
let workspaceName = null;
let schemeName = null;
let destination = null;
let launchTarget = null;

async function readWorkspace() {
  // read workspace directory to 
  // get .xcworkspace basename
  var files = await readdir(projectRoot)
  files.forEach((file) => {
    if (file.endsWith(".xcworkspace")) {
      workspaceName = file;
      tools.log("workspace name: " + workspaceName);
      return workspaceName
    }
  })
}

async function registerCommands(context) {
  // register commands to vscode

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let buildDisposable = vscode.commands.registerCommand('extension.build', async function () {
    // The code you place here will be executed every time your command is executed
    if (!schemeName) await selectScheme()
    if (!destination) await selectDestination()
    tools.exec(
      'xcodebuild build -workspace ' + workspaceName + ' -scheme ' + schemeName + ' -allowProvisioningUpdates  -derivedDataPath build -destination ' + destination,
      { cwd: projectRoot }
    ).then(
      response => {
        tools.info("stdout: " + response.stdout);
        tools.info("stderr: " + response.stderr);
        vscode.window.showInformationMessage('build success');
      }
    ).catch(
      error => {
        tools.info("stderr: " + error.stderr);
        vscode.window.showInformationMessage('build failed');
      }
    )
  });

  context.subscriptions.push(buildDisposable);
  let runDisposable = vscode.commands.registerCommand('extension.run', async function () {
    // The code you place here will be executed every time your command is executed
    if(!launchTarget) await selectLaunchTarget();
    if (!schemeName) await selectScheme();
    // build/Build/Products/Debug-iphonesimulator/<schemeName>.app
    var appPath = 'build/Build/Products/Debug-iphonesimulator/' + schemeName + '.app';
    simctl.launchApp(projectRoot, launchTarget, appPath).then(
      response => {
        console.log('stdout: ' + response.stdout);
        console.log('stderr: ' + response.stderr);
        vscode.window.showInformationMessage('running');
      }
    ).catch(
      error => {
        console.log('error: ' + error.stderr);
        vscode.window.showInformationMessage('start emulator error');
      }
    )
  });
  context.subscriptions.push(runDisposable);
}

async function selectScheme(){
  var schemes = await xcode.list_schemes(workspaceName, projectRoot)
  schemeName = await vscode.window.showQuickPick(schemes, {placeHolder: "select scheme: "});
}

async function selectDestination(){
  var destinations = await xcode.list_destination(workspaceName, projectRoot, schemeName);
  destination = await vscode.window.showQuickPick(destinations, {placeHolder: "select destination: "});
}

async function selectLaunchTarget() {
  var emulators = simctl.list_emulators()
  launchTarget = await vscode.window.showQuickPick(emulators, {placeHolder: "select launch target: "});
}

async function test() {
  await simctl.list_emulators()
}

module.exports = {
  readWorkspace,
  projectRoot,
  registerCommands,
  test
}