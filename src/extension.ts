import * as vscode from 'vscode';
import GithubHelper from './helpers/github-helper';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "github-actions-generator" is now active!');

	const disposable = vscode.commands.registerCommand('github-actions-generator.helloWorld', async () => {
		
		const githubHelper = new GithubHelper();
		console.log('These are the commits:', await githubHelper.getCommits());	
		vscode.window.showInformationMessage('Hello World from github-actions-generator!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
