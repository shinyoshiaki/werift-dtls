import { encode, types } from "binary-data";
import { DtlsPlaintextHeader } from "../record/message/header";
import { ProtocolVersion } from "../handshake/binary";
import * as crypto from "crypto";

export class CryptoGCM {
  nonceImplicitLength = 4;
  authTagLength = 16;
  blockAlgorithm?: crypto.CipherCCMTypes | crypto.CipherGCMTypes;

  constructor(
    public localKey: Buffer,
    public localWriteIV: Buffer,
    public remoteKey: Buffer,
    public remoteWriteIV: Buffer
  ) {}

  encrypt(data: Buffer, pkt: DtlsPlaintextHeader, isClient: boolean) {
    const payload = data.slice(13);
    const header = data.slice(0, 13);

    const iv = isClient ? this.localWriteIV : this.remoteWriteIV;
    const writeKey = isClient ? this.localKey : this.remoteKey;

    const nonce = Buffer.concat([iv.slice(0, 4), crypto.randomBytes(8)]);

    const additionalData = {
      epoch: pkt.epoch,
      sequence: pkt.sequenceNumber,
      type: pkt.contentType,
      version: pkt.protocolVersion,
      length: payload.length,
    };

    const additionalBuffer = Buffer.from(
      encode(additionalData, AEADAdditionalData).slice()
    );

    const cipher = crypto.createCipheriv(
      this.blockAlgorithm as any,
      writeKey,
      nonce,
      {
        authTagLength: this.authTagLength,
      }
    );

    cipher.setAAD(additionalBuffer, {
      plaintextLength: data.length,
    });

    const headPart = cipher.update(payload);
    cipher.final();
    const authtag = cipher.getAuthTag();

    let encryptedPayload = Buffer.concat([headPart, authtag]);
    encryptedPayload = Buffer.concat([nonce.slice(4), encryptedPayload]);
    const packet = Buffer.concat([header, encryptedPayload]);
    packet[13 - 2] = packet.length - 13;

    return packet;
  }
}

const AEADAdditionalData = {
  epoch: types.uint16be,
  sequence: types.uint48be,
  type: types.uint8,
  version: ProtocolVersion,
  length: types.uint16be,
};
