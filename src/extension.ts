// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { parseJSX, parseImports, PraseJSXResult, ParseImportsResult } from './parser';
import * as path from 'path';
import * as fs from 'fs';

interface NewComponentInfo {
	newComponentName: string
	newComponentFileName: string
	newComponentContentInfo: PraseJSXResult
	newComponentContent: string
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.smartExtractReactComponent', async () => {
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

		const fileContent = editor.document.getText();
		const fileExtension = path.basename(editor.document.fileName).split('.').pop();
		const folderPath = path.dirname(editor.document.fileName); // get the open folder path

		// Prompt for new component Name
		const options = {
			prompt: 'Enter a component name',
			placeHolder: 'MyComponent'
		};

		const inputValue = await vscode.window.showInputBox(options);
		if (!inputValue) {
			vscode.window.showErrorMessage('Invalid component name');
			return;
		}
		
		let newComponentContentInfo: PraseJSXResult;
		let fileContentImportsInfo: ParseImportsResult;
		try {
			newComponentContentInfo = parseJSX(selectedText);
			fileContentImportsInfo = parseImports(fileContent);
		} catch {
			vscode.window.showErrorMessage('Invalid selection');
			return;
		}

		const spaceFreeValue = inputValue.replace(/ /g, '');
		const newComponentName = spaceFreeValue[0].toUpperCase() + spaceFreeValue.slice(1);
		const newComponentFileName = spaceFreeValue;
		const newComponentImportsInfo = fileContentImportsInfo
			?.map(importInfo => ({
				...importInfo,
				destructingImports: importInfo.destructingImports
					.filter((importName) => newComponentContentInfo.components?.findIndex(component => component === importName) !== -1),
				defaultImport: newComponentContentInfo.components?.find(component => component === importInfo.defaultImport)
			}))
			.filter(importInfo => importInfo.defaultImport !== undefined || importInfo.destructingImports.length > 0);

		const newComponentContent = 
`import React from 'react'
${newComponentImportsInfo?.map(({defaultImport, destructingImports, from}) => {
	if (defaultImport) {
		if (destructingImports.length > 0) {
			return 'import ' + defaultImport + ', { ' + destructingImports.join(', ') + " } from '" + from + "'";
		} else {
			return 'import ' + defaultImport + " from '" + from + "'";
		}
	} else {
		return 'import { ' + destructingImports.join(', ') + " } from '" + from + "'";
	}
}).join('\n')}

export const ${newComponentName} = ({${newComponentContentInfo.props?.join(', ')}}) => (
	${selectedText}
)
`;
		fs.writeFile(
			path.join(folderPath, `${newComponentFileName}.${fileExtension}`), 
			newComponentContent, 
			(err) => {
				if (err) {
					vscode.window.showErrorMessage('Something went wrong while writing the file');
					return;
				}
			}
		);
		try {
			editor.edit(builder => {
				builder.replace(selection, `<${newComponentName} ${newComponentContentInfo.props?.map(prop => prop + '={' + prop + '}').join(' ')}/>`);
				builder.insert(new vscode.Position(0, 0), `import { ${newComponentName} } from './${newComponentFileName}'\n`);
			});
		} catch {
			vscode.window.showErrorMessage('Something went wrong while updating current file');
			return;
		}
		vscode.window.showInformationMessage('Component extraction completed successfully!');
	});
	
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
