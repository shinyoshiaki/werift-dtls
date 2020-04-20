import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../const";
import { Random, ExtensionList } from "../../binary";
const { uint16be, uint8, buffer, array } = types;

// 7.4.1.2.  Client Hello

export class ClientHello {
  msgType = HandshakeType.client_hello;
  messageSeq: number;
  static readonly spec = {
    clientVersion: { major: uint8, minor: uint8 },
    random: Random,
    sessionId: buffer(uint8),
    cookie: buffer(uint8),
    cipherSuites: array(uint16be, uint16be, "bytes"),
    compressionMethods: array(uint8, uint8, "bytes"),
    extensions: ExtensionList,
  };

  constructor(
    public clientVersion: { major: number; minor: number },
    public random: { gmt_unix_time: number; random_bytes: Buffer },
    public sessionId: Buffer,
    public cookie: Buffer,
    public cipherSuites: number[],
    public compressionMethods: number[],
    public extensions: any
  ) {}

  static createEmpty() {
    return new ClientHello(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  static deSerialize(buf: Buffer) {
    return new ClientHello(
      //@ts-ignore
      ...Object.values(decode(buf, ClientHello.spec))
    );
  }

  static from(spec: typeof ClientHello.spec) {
    //@ts-ignore
    return new ClientHello(...Object.values(spec));
  }

  serialize() {
    const res = encode(this, ClientHello.spec).slice();
    return Buffer.from(res);
  }
}
