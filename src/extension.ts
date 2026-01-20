import * as vscode from 'vscode';
import GithubHelper from './helpers/github-helper';
import GitHelper from './helpers/git-helper';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "github-actions-generator" is now active!');

	const disposable = vscode.commands.registerCommand('github-actions-generator.createPullRequestToChangeVariable', async () => {
		const githubHelper = new GithubHelper();
		const openAIKey = vscode.workspace.getConfiguration('github-actions-generator').get('openAIKey');
		await githubHelper.createSecret('OPENAI_API_KEY', openAIKey as string);
		try{
			await githubHelper.addWorkflowToRepository('open-ai-reviewer.yml');
		} catch (error) {
			console.error('Error adding workflow to repository:', error);
		}

		const branchName = await GitHelper.createBranchCommitAndPush();
		const pullRequestResponse = await githubHelper.createPullRequest(
			branchName as string,
			'Increments the count of replicas by 1',
			'This PR increments the count of replicas in the configuration file.'
		);

		const url = vscode.Uri.parse(pullRequestResponse.html_url);
		vscode.env.openExternal(url);

		vscode.window.showInformationMessage('Hello World from github-actions-generator!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
