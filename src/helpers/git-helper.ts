import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path/win32';
import simpleGit from 'simple-git';
import YAML from 'yaml';

interface Config {
  strategy: string;
  replicas: number;
}

export default class GitHelper {
    static async getUsername(): Promise<string> {
        const git = simpleGit();
        const config = await git.getConfig('user.name');
        return config.value || 'Unknown User';
    }

    static async getEmail(): Promise<string> {
        const git = simpleGit();
        const config = await git.getConfig('user.email');
        return config.value || 'lkacimi@gmail.com';
    }

    static async createBranchCommitAndPush() : Promise<string> {

        const pathToLocalRepository = vscode.workspace.getConfiguration('github-actions-generator').get('pathToLocalRepository') as string;
        const git = simpleGit(pathToLocalRepository);
        const branchName = `feature/increment-replicas-${Math.floor(Date.now() / 1000)}`;
        const fileName = vscode.workspace.getConfiguration('github-actions-generator').get('configurationPath') as string;
        const filePath = path.join(pathToLocalRepository, fileName).replace(/\\/g, '/');
        const fileContent =  fs.readFileSync(filePath, { encoding: 'utf-8' });
        const config: Config = YAML.parse(fileContent);
        config.replicas = config.replicas + 1;
        const updatedYamlContent = YAML.stringify(config);
        const commitMessage = `Increments the number of ${vscode.workspace.getConfiguration('github-actions-generator').get('configurationVariable')} in the configuration file.`;
        
        try {
            await git.checkoutLocalBranch(branchName);
        
            fs.writeFileSync(filePath, updatedYamlContent, { encoding: 'utf-8' });

            await git.add(filePath);
            await git.commit(commitMessage);
            await git.push('origin', branchName, ['--set-upstream']);

            await git.checkout('main');

            return branchName;

        } catch (err) {
            console.error('An error occurred during the Git workflow:', err);
            throw err;
        }
    }
}