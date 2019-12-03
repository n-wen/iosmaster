const path = require("path");
const vscode = require('vscode');
const fs = require("fs");
const tools = require("./tools");

// project absolute path
const projectRoot = vscode.workspace.workspaceFolders[0].uri.path;
// used for xcodebuild
let workspaceName = null;

function readWorkspace() {
  // read workspace directory to 
  // get .xcworkspace basename
  tools.log("read workspace.")
  fs.readdir(projectRoot, (err, files) => {
    if (err) {
      tools.log(err)
    } else
      files.forEach((file) => {
        tools.log(file)
        if (file.endsWith(".xcworkspace")) {
          workspaceName = file
        }
      })
    tools.log("workspace name: " + workspaceName);
  })
}

function registerCommands(context) {
  // register commands to vscode

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let buildDisposable = vscode.commands.registerCommand('extension.build', function () {
    // The code you place here will be executed every time your command is executed
    tools.exec(
      'xcodebuild build -workspace ' + workspaceName + ' -scheme Foo -allowProvisioningUpdates  -derivedDataPath build -destination \'platform=iOS Simulator,name=iPhone 6,OS=12.1\'',
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
  let runDisposable = vscode.commands.registerCommand('extension.run', function () {
    // The code you place here will be executed every time your command is executed

    tools.exec(
      'ios-sim launch build/Build/Products/Debug-iphonesimulator/Foo.app',
      { cwd: projectRoot },
    ).then(
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



function test() {
  tools.exec("pwds").then(
    response => {
      tools.log(response);
    }
  ).catch(
    error => {
      tools.log(error);
    }
  )
}

module.exports = {
  readWorkspace,
  projectRoot,
  workspaceName,
  registerCommands,
  test
}