import { NamedCurveKeyPair } from "../cipher/namedCurve";
import { Handshake } from "../typings/domain";
import { DtlsRandom } from "../handshake/random";
import AEADCipher from "../cipher/cipher/aead";

export class ClientContext {
  version = { major: 255 - 1, minor: 255 - 2 };
  lastFlight: Handshake[] = [];
  sequenceNumber = 0;
  epoch = 0;
  flight = 0;
  handshakeCache: { isLocal: boolean; data: Buffer; flight: number }[] = [];
  localRandom?: DtlsRandom;
  remoteRandom?: DtlsRandom;
  cipherSuite?: number;
  remoteCertificate?: Buffer;
  remoteKeyPair?: Partial<NamedCurveKeyPair>;
  localKeyPair?: NamedCurveKeyPair;
  masterSecret?: Buffer;
  cipher?: AEADCipher;

  bufferHandshake(data: Buffer, isLocal: boolean, flight: number) {
    this.handshakeCache = [...this.handshakeCache, { isLocal, data, flight }];
  }
}
