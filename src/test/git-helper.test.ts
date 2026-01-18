import * as assert from 'assert';
import * as sinon from 'sinon';
import GitHelper from '../helpers/git-helper';
import { beforeEach, afterEach } from 'mocha';


suite('Git Test Suite', () => {

    let staticGitHelperStub: sinon.SinonStub;
    
    beforeEach(() => {
        staticGitHelperStub = sinon.stub(GitHelper, 'getUsername');
    }); 
    
    afterEach(() => {
        staticGitHelperStub.restore();
    });

    test('Should return the correct git username', () => {
        staticGitHelperStub.returns('TestUser');
        assert.strictEqual(GitHelper.getUsername(), 'TestUser');
    });
});