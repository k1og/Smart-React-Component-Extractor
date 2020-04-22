// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { parse } from './parser';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.smartExtractReactComponent', () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return; // No open text editor
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No text selected');
			return; 
		}

		let folderPath = path.dirname(editor.document.fileName); // get the open folder path

		// Check if folder is in workspace
		if (folderPath === '.') {
			return vscode.window.showErrorMessage("Your file must be in a workspace");
		}

		// Prompt for new component Name
		const options = {
			prompt: 'Enter a component name',
			placeHolder: 'MyComponent'
		};

		vscode.window.showInputBox(options).then(value => {
			if (!value) {
				return vscode.window.showErrorMessage('Invalid component name');
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
			
			editor.edit(builder => builder.replace(selection, `<${newComponentName} ${newComponentInfo.props?.map(prop => prop + '={' + prop + '}').join(' ')}/>`))
				.then(() => {
					fs.writeFile(path.join(folderPath, `${newComponentFileName}.jsx`), newComponentContent, (err) => {
						if (err) {
							return vscode.window.showErrorMessage('Something went wrong while writing the file');
						}
						vscode.window.showInformationMessage('Component extraction completed successfully!');
					});
				});
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
