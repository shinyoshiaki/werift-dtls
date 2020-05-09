import { NamedCurveKeyPair } from "../cipher/namedCurve";
import { DtlsRandom } from "../handshake/random";
import AEADCipher from "../cipher/cipher/aead";

export class CipherContext {
  localRandom?: DtlsRandom;
  remoteRandom?: DtlsRandom;
  cipherSuite?: number;
  remoteCertificate?: Buffer;
  remoteKeyPair?: Partial<NamedCurveKeyPair>;
  localKeyPair?: NamedCurveKeyPair;
  masterSecret?: Buffer;
  cipher?: AEADCipher;
}
