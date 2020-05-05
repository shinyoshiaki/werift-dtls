import { ClientHello } from "../handshake/message/client/hello";
import { NamedCurveKeyPair } from "../cipher/namedCurve";
import { Handshake } from "../typings/domain";
import { HandshakeType } from "../handshake/const";
import { DtlsRandom } from "../handshake/random";
import { EcdheEcdsaWithAes128GcmSha256 } from "../cipher/suite/ecdsaWithAes128GcmSha256";

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
  cipher?: EcdheEcdsaWithAes128GcmSha256;

  bufferHandshake(handshakes: Handshake[], isLocal: boolean, flight: number) {
    const buffers = handshakes
      .filter((message) => {
        switch (message.msgType) {
          case HandshakeType.hello_verify_request:
            return false;
          case HandshakeType.hello_request:
            return false;
          case HandshakeType.client_hello:
            const cookie = (message as ClientHello).cookie;
            return cookie?.length > 0;
          default:
            return true;
        }
      })
      .map((handshake) => handshake.serialize());
    this.handshakeCache = [
      ...this.handshakeCache,
      ...buffers.map((data) => ({ isLocal, data, flight })),
    ];
  }
}
