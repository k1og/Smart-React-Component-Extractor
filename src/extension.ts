// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { parse } from './parser';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.extractReactComponent', () => {
		const editor = vscode.window.activeTextEditor;

		const selection = editor?.selection;
		const selectedText = editor?.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No text selected');
			return; 
		}

		// Prompt for new component Name
		const options = {
			prompt: 'Enter a component name',
			placeHolder: 'MyComponent'
		};

		vscode.window.showInputBox(options).then(value => {
			if (!value) {
				vscode.window.showErrorMessage('No component name');
				return; 
			}
			
			const spaceFreeValue = value.replace(/ /g, '');
			const newComponentName = spaceFreeValue[0].toUpperCase() + spaceFreeValue.slice(1);
			const newComponentFileName = spaceFreeValue;
			const newComponentInfo = parse(selectedText);
			const newComponentContent = `
			import React from 'react'

			export const ${newComponentName} = (${newComponentInfo.props?.join(', ')}) => (
				${selectedText}
			)
			`;
			console.log(newComponentContent);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
