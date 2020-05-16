import { NamedCurveKeyPair } from "../cipher/namedCurve";
import { DtlsRandom } from "../handshake/random";
import AEADCipher from "../cipher/suites/aead";
import { DtlsPlaintext } from "../record/message/plaintext";
import { ProtocolVersion } from "../handshake/binary";
import { encode, decode, types } from "binary-data";
import { prfVerifyDataClient } from "../cipher/prf";
import { sessionType } from "../cipher/suites/abstract";
import { PrivateKey } from "@fidm/x509";

export class CipherContext {
  localRandom?: DtlsRandom;
  remoteRandom?: DtlsRandom;
  cipherSuite?: number;
  remoteCertificate?: Buffer;
  remoteKeyPair?: Partial<NamedCurveKeyPair>;
  localKeyPair?: NamedCurveKeyPair;
  masterSecret?: Buffer;
  cipher?: AEADCipher;
  namedCurve?: number;
  localPrivateKey?: PrivateKey;

  encryptPacket(pkt: DtlsPlaintext) {
    const header = pkt.recordLayerHeader;
    const enc = this.cipher?.encrypt(sessionType.CLIENT, pkt.fragment, {
      type: header.contentType,
      version: decode(
        Buffer.from(encode(header.protocolVersion, ProtocolVersion).slice()),
        { version: types.uint16be }
      ).version,
      epoch: header.epoch,
      sequenceNumber: header.sequenceNumber,
    })!;
    pkt.fragment = enc;
    pkt.recordLayerHeader.contentLen = enc.length;
    return pkt;
  }

  decryptPacket(pkt: DtlsPlaintext) {
    const header = pkt.recordLayerHeader;
    return this.cipher?.decrypt(sessionType.CLIENT, pkt.fragment, {
      type: header.contentType,
      version: decode(
        Buffer.from(encode(header.protocolVersion, ProtocolVersion).slice()),
        { version: types.uint16be }
      ).version,
      epoch: header.epoch,
      sequenceNumber: header.sequenceNumber,
    })!;
  }

  verifyData(buf: Buffer) {
    return prfVerifyDataClient(this.masterSecret!, buf);
  }
}
