import * as vscode from 'vscode';
import { readFileSync } from 'fs';
import GitHelper from './git-helper';
import EncryptionHelper from './encryption-helper';


type PublicKey ={
    key_id: string;
    key: string;
}

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

    /**
     * Get the commits for the repository.
     * This method was implemented to verify that the authorization token is working correctly.
     * @returns an array of commits
     */

    async getCommits() {

        try {
            const username = await GitHelper.getUsername();
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

    /**
     * Get the public key for the repository to encrypt secrets
     * @return PublicKey
     */

    async getRepositoryPublicKey(): Promise<PublicKey> {
        try {
            const username = await GitHelper.getUsername();
            const response = await fetch(`https://api.github.com/repos/${username}/${this.repository}/actions/secrets/public-key`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
            const publicKey = await response.json();
            return (publicKey as PublicKey);

        }
        catch (error) {
            console.error('Error fetching public key:', error);
            throw error;
        }
    }

    /**
     * Helper to create a secret which can then be referenced in GitHub Actions workflows
     * @param secretName
     * @param secretValue
     */
    async createSecret(secretName: string, secretValue: string) {

        try {
            const publicKey:PublicKey = await this.getRepositoryPublicKey();
            const username = await GitHelper.getUsername();
            const encryptedValue = await EncryptionHelper.encryptSecret(publicKey.key, secretValue);

            const response = await fetch(`https://api.github.com/repos/${username}/${this.repository}/actions/secrets/${secretName}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    },
                    body: JSON.stringify({
                        'encrypted_value': encryptedValue,
                        'key_id': publicKey.key_id,
                    })
                });
            if (!response.ok) {
                throw new Error(`Error creating secret: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error creating secret:', error);
            throw error;
        }
    }

    async addWorkflowToRepository(workflowFileName: string) {
        try {
             const username = await GitHelper.getUsername();
             const email = await GitHelper.getEmail();

             const workflowFileContent = readFileSync(`${__dirname}/../src/workflows/${workflowFileName}`, 'utf-8');
             const response = await fetch(`https://api.github.com/repos/${username}/${this.repository}/contents/.github/workflows/${workflowFileName}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    },
                    body: JSON.stringify({
                        'message': `Adds workflow ${workflowFileName}`,
                        commiter: {
                            name: username,
                            email: email
                        },
                        'content': Buffer.from(workflowFileContent).toString('base64'),
                    })
                });
            if (!response.ok) {
                throw new Error(`Error adding workflow: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding workflow:', error);
            throw error;
        }
    }

}
