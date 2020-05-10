import * as crypto from "crypto";
import { pHash } from "./utils";
import Cipher from "./abstract";
import { prfPHash } from "../prf";
const {
  createDecode,
  encode,
  types: { uint8, uint16be, uint48be },
} = require("binary-data");

const ContentType = uint8;
const ProtocolVersion = uint16be;

const AEADAdditionalData = {
  epoch: uint16be,
  sequence: uint48be,
  type: ContentType,
  version: ProtocolVersion,
  length: uint16be,
};

type Header = {
  type: number;
  version: number;
  epoch: number;
  sequenceNumber: number;
};

const sessionType = {
  CLIENT: 1,
  SERVER: 2,
};

/**
 * This class implements AEAD cipher family.
 */
export default class AEADCipher extends Cipher {
  keyLength = 0;
  nonceLength = 0;
  ivLength = 0;
  authTagLength = 0;

  nonceImplicitLength = 0;
  nonceExplicitLength = 0;

  clientWriteKey?: Buffer;
  serverWriteKey?: Buffer;

  clientNonce?: Buffer;
  serverNonce?: Buffer;

  constructor() {
    super();
  }

  /**
   * Initialize encryption and decryption parts.
   * @param {Session} session
   */
  init(session: {
    masterSecret: Buffer;
    serverRandom: Buffer;
    clientRandom: Buffer;
  }) {
    const size = this.keyLength * 2 + this.ivLength * 2;
    const secret = session.masterSecret;
    const seed = Buffer.concat([session.serverRandom, session.clientRandom]);
    const keyBlock = prfPHash(
      secret,
      Buffer.concat([Buffer.from("key expansion"), seed]),
      size,
      this.hash!
    );
    const stream = createDecode(keyBlock);

    this.clientWriteKey = stream.readBuffer(this.keyLength);
    this.serverWriteKey = stream.readBuffer(this.keyLength);

    const clientNonceImplicit = stream.readBuffer(this.ivLength);
    const serverNonceImplicit = stream.readBuffer(this.ivLength);

    this.clientNonce = Buffer.alloc(this.nonceLength, 0);
    this.serverNonce = Buffer.alloc(this.nonceLength, 0);

    clientNonceImplicit.copy(this.clientNonce, 0);
    serverNonceImplicit.copy(this.serverNonce, 0);
  }

  /**
   * Encrypt message.
   * @param {Session} session
   * @param {Buffer} data Message to encrypt.
   * @param {Object} header Record layer message header.
   * @returns {Buffer}
   */
  encrypt(
    session: {
      type: number;
    },
    data: Buffer,
    header: Header
  ) {
    const isClient = session.type === sessionType.CLIENT;
    const iv = isClient ? this.clientNonce! : this.serverNonce!;

    const writeKey = isClient ? this.clientWriteKey : this.serverWriteKey;

    iv.writeUInt16BE(header.epoch, this.nonceImplicitLength);
    iv.writeUIntBE(header.sequenceNumber, this.nonceImplicitLength + 2, 6);

    const explicitNonce = iv.slice(this.nonceImplicitLength);

    const additionalData = {
      epoch: header.epoch,
      sequence: header.sequenceNumber,
      type: header.type,
      version: header.version,
      length: data.length,
    };

    const additionalBuffer = encode(additionalData, AEADAdditionalData).slice();

    const cipher = crypto.createCipheriv(
      this.blockAlgorithm! as any,
      writeKey!,
      iv,
      {
        authTagLength: this.authTagLength,
      }
    );

    cipher.setAAD(additionalBuffer, {
      plaintextLength: data.length,
    });

    const headPart = cipher.update(data);
    const finalPart = cipher.final();
    const authtag = cipher.getAuthTag();

    return Buffer.concat([explicitNonce, headPart, finalPart, authtag]);
  }

  /**
   * Decrypt message.
   * @param {Buffer} session
   * @param {Buffer} data Encrypted message.
   * @param {Object} header Record layer headers.
   * @returns {Buffer}
   */
  decrypt(session: { type: number }, data: Buffer, header: Header) {
    const isClient = session.type === sessionType.CLIENT;
    const iv = isClient ? this.serverNonce : this.clientNonce;
    const final = createDecode(data);

    const explicitNonce = final.readBuffer(this.nonceExplicitLength);
    explicitNonce.copy(iv, this.nonceImplicitLength);

    const encryted = final.readBuffer(final.length - this.authTagLength);
    const authTag = final.readBuffer(this.authTagLength);
    const writeKey = isClient ? this.serverWriteKey : this.clientWriteKey;

    const additionalData = {
      epoch: header.epoch,
      sequence: header.sequenceNumber,
      type: header.type,
      version: header.version,
      length: encryted.length,
    };

    const additionalBuffer = encode(additionalData, AEADAdditionalData).slice();

    const decipher = crypto.createDecipheriv(
      this.blockAlgorithm! as any,
      writeKey!,
      iv!,
      {
        authTagLength: this.authTagLength,
      }
    );

    decipher.setAuthTag(authTag);
    decipher.setAAD(additionalBuffer, {
      plaintextLength: encryted.length,
    });

    const headPart = decipher.update(encryted);
    const finalPart = decipher.final();

    return finalPart.length > 0
      ? Buffer.concat([headPart, finalPart])
      : headPart;
  }
}
