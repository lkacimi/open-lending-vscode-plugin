import * as vscode from 'vscode';
import GitHelper from './git-helper';

export default class GithubHelper {
    configurationPath: string | undefined;
    variableName: string | undefined;
    repository: string | undefined;
    token: string | undefined;
    username: string | undefined;

    constructor() {
        const pluginConfig = vscode.workspace.getConfiguration('github-actions-generator');
		this.configurationPath = pluginConfig.get('configurationPath');
		this.variableName = pluginConfig.get('configurationVariableName');
		this.repository = pluginConfig.get('repository');
		this.token = pluginConfig.get('token');
    }

    async getCommits() {

        const username = await GitHelper.getUsername();
        try {
            const response = await fetch(`https://api.github.com/repos/${username}/${this.repository}/commits`, {
                    method: 'GET',
                    headers: {	
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });

            const commits = await response.json();
            return commits;   

        } catch (error) {
            console.error('Error fetching commits:', error);
            throw error;
        }  
    }
}
