const vscode = require('vscode');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


// Replace with your actual Google Cloud Project API key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// This method is called when your extension is activated
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "codemate" is now active!');

	let disposable = vscode.commands.registerCommand('codemate.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from codemate!');
	});

	let userPrompt = vscode.commands.registerCommand('codemate.prompt', async function() {
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
	});

	let selectedText = vscode.commands.registerCommand('codemate.selectcode', async function() {
		const editor = vscode.window.activeTextEditor;

		if (!editor || !editor.selection) {
			vscode.window.showErrorMessage('No selection found.');
			return null; // Handle no selection
		}
	  
		const selection = editor.selection;
		const text = editor.document.getText(selection);

		vscode.window.showInformationMessage(text.trim());
	  
		return text.trim(); // Remove leading/trailing whitespace
	});

	let processPrompt = vscode.commands.registerCommand('codemate.processPrompt', async function() {
		try {
			const prompt = await vscode.commands.executeCommand('codemate.prompt');
			if (!prompt) return;

			const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
			const model = genAI.getGenerativeModel({ model: "gemini-pro" });

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = await response.text();
			
			const panel = vscode.window.createWebviewPanel(
				'codemateResponse',
				'CodeMate AI Response',
				vscode.ViewColumn.One,
				{}
			);

			panel.webview.html = getWebviewContent(text);
		} catch (error) {
			if (error.response && error.response.status === 404) {
				vscode.window.showErrorMessage('Model not found or not available. Please check the model name and your API key.');
			} else {
				vscode.window.showErrorMessage(`Error processing prompt: ${error.message}`);
			}
			console.error(`Error processing prompt: ${error.stack}`);
		}
	});

	context.subscriptions.push(userPrompt); // user prompt
	context.subscriptions.push(selectedText); // returns selected text
	context.subscriptions.push(processPrompt); // process prompt command
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

function getWebviewContent(response) {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>CodeMate AI Response</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
					margin: 0;
					padding: 20px;
					background-color: #f0f4f8;
					color: #333;
				}
				pre {
					background-color: #e8f5e9;
					border: 1px solid #c8e6c9;
					padding: 10px;
					border-radius: 5px;
					overflow: auto;
				}
				button {
					background-color: #4caf50;
					color: white;
					border: none;
					padding: 10px 20px;
					text-align: center;
					text-decoration: none;
					display: inline-block;
					font-size: 16px;
					margin: 4px 2px;
					cursor: pointer;
					border-radius: 16px;
				}
			</style>
		</head>
		<body>
			<h1>AI Response</h1>
			<pre>${response}</pre>
			<button onclick="register()">Register</button>
			<div id="form-container" style="display:none;">
				<h2>Registration Form</h2>
				<form id="registration-form">
					<label for="name">Name:</label><br>
					<input type="text" id="name" name="name"><br>
					<label for="email">Email:</label><br>
					<input type="email" id="email" name="email"><br><br>
					<input type="submit" value="Submit">
				</form>
			</div>
			<script>
				function register() {
					document.getElementById('form-container').style.display = 'block';
				}
				document.getElementById('registration-form').onsubmit = function(event) {
					event.preventDefault();
					document.body.innerHTML = '<h1>Thank you for registering!</h1>';
				}
			</script>
		</body>
		</html>
	`;
}

module.exports = {
	activate,
	deactivate
}
