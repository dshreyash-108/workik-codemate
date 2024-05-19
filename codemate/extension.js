// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

async function getSelectedText() {
  const editor = vscode.window.activeTextEditor;

  if (!editor || !editor.selection) {
    vscode.window.showErrorMessage('No selection found.');
    return null; // Handle no selection
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  return text.trim(); // Remove leading/trailing whitespace
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codemate" is now active!');
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('codemate.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from codemate!');
	});

	let userPrompt = vscode.commands.registerCommand('codemate.Prompt', async function(){
		const prompt = await vscode.window.showInputBox({
			title: 'Enter your prompt:',
			placeHolder: 'Write your code generation or debugging request here.',
		  });
		
		  if (prompt === undefined) {
			vscode.window.showErrorMessage('Prompt cancelled.');
			return null; // Handle cancelled prompt
		  } else {
			return prompt.trim(); // Remove leading/trailing whitespace
		  }
		  
	})

	let selectedText = vscode.commands.registerCommand('codemate.selectcode', async function(){
		const editor = vscode.window.activeTextEditor;

		if (!editor || !editor.selection) {
		  vscode.window.showErrorMessage('No selection found.');
		  return null; // Handle no selection
		}
	  
		const selection = editor.selection;
		const text = editor.document.getText(selection);

		vscode.window.showInformationMessage(text.trim());
	  
		return text.trim(); // Remove leading/trailing whitespace
	})

	context.subscriptions.push(userPrompt); // user prompt

	context.subscriptions.push(selectedText); // returns selected text

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
