import { prfEncryptionKeys } from "../prf";
import { CryptoGCM } from "../gcm";

export class EcdheEcdsaWithAes128GcmSha256 {
  cryptoGCM?: CryptoGCM;

  init(
    masterSecret: Buffer,
    clientRandom: Buffer,
    serverRandom: Buffer,
    isClient: boolean
  ) {
    const prfMacLen = 0,
      prfKeyLen = 16,
      prfIvLen = 12;

    const keys = prfEncryptionKeys(
      masterSecret,
      clientRandom,
      serverRandom,
      prfMacLen,
      prfKeyLen,
      prfIvLen
    );

    if (isClient) {
      this.cryptoGCM = new CryptoGCM(
        keys.clientWriteKey,
        keys.clientWriteIV,
        keys.serverWriteKey,
        keys.serverWriteIV
      );
      this.cryptoGCM.blockAlgorithm = "aes-128-gcm";
    }
  }
}
