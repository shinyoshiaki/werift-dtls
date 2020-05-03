import { ClientHello } from "../handshake/message/client/hello";
import { NamedCurveKeyPair } from "../cipher/namedCurve";

export class ClientContext {
  version = { major: 255 - 1, minor: 255 - 2 };
  lastFlight: ClientHello[] = [];
  lastSentSeqNum = -1;
  random?: Random;
  cipherSuite?: number;
  remoteCertificate?: Buffer;
  remoteKeyPair?: Partial<NamedCurveKeyPair>;
  localKeyPair?: NamedCurveKeyPair;
}
