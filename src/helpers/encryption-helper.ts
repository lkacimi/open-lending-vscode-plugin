const sodium = require('libsodium-wrappers');

export default class EncryptionHelper {
    static async encryptSecret(publicKey: string, secretValue: string): Promise<string> {
        await sodium.ready;
        const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
        const binsec = sodium.from_string(secretValue);
        const encryptedBytes = sodium.crypto_box_seal(binsec, binkey);
        return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);
    }
}