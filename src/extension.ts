// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { parseJSX, parseImports, ImportType } from './parser';
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
			return vscode.window.showErrorMessage('No text selected');
		}
		const fileContent = editor.document.getText();
		const fileExtension = path.basename(editor.document.fileName).split('.').pop();
		const folderPath = path.dirname(editor.document.fileName); // get the open folder path

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
			const newComponentInfo = parseJSX(selectedText);
			const fileContentImportsInfo = parseImports(fileContent);
			const newComponentImportsInfo = fileContentImportsInfo
				?.map(importInfo => ({
					...importInfo,
					destructingImports: importInfo.destructingImports.filter((importName) => newComponentInfo.components?.findIndex(component => component === importName) !== -1),
					defaultImport: newComponentInfo.components?.find(component => component === importInfo.defaultImport)
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

export const ${newComponentName} = ({${newComponentInfo.props?.join(', ')}}) => (
	${selectedText}
)
`;
			
			editor.edit(builder => {
				builder.replace(selection, `<${newComponentName} ${newComponentInfo.props?.map(prop => prop + '={' + prop + '}').join(' ')}/>`);
				builder.insert(new vscode.Position(0, 0), `import { ${newComponentName} } from './${newComponentFileName}'\n`);
			})
				.then(() => {
					fs.writeFile(path.join(folderPath, `${newComponentFileName}.${fileExtension}`), newComponentContent, (err) => {
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
