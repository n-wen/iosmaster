// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cp = require('child_process')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"iosmaster" is now active!');
	const projectRoot = vscode.workspace.workspaceFolders[0].uri.path;
	console.log("project root: " + projectRoot);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let buildDisposable = vscode.commands.registerCommand('extension.build', function () {
		// The code you place here will be executed every time your command is executed
		cp.exec('xcodebuild build -workspace Foo.xcworkspace -scheme Foo -allowProvisioningUpdates  -derivedDataPath build -destination \'platform=iOS Simulator,name=iPhone 6,OS=12.1\'', 
		{cwd: projectRoot},
		(err, stdout, stderr) => {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (err) {
						console.log('error: ' + err);
				}
		});
		// Display a message box to the user
		vscode.window.showInformationMessage('build success');
	});

	context.subscriptions.push(buildDisposable);
	let runDisposable = vscode.commands.registerCommand('extension.run', function () {
		// The code you place here will be executed every time your command is executed
		
		cp.exec('ios-sim launch build/Build/Products/Debug-iphonesimulator/Foo.app',
		{cwd: projectRoot},
		(err, stdout, stderr) => {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
					console.log('error: ' + err);
			}
	});
		// Display a message box to the user
		vscode.window.showInformationMessage('running');
	});

	context.subscriptions.push(runDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
