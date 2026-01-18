import simpleGit from 'simple-git';

export default class GitHelper {
    static async getUsername(): Promise<string> {
        const git = simpleGit();
        const config = await git.getConfig('user.name');
        return config.value || 'Unknown User';
    }
}