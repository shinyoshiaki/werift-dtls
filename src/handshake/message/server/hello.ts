import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../const";
import { Random, ExtensionList } from "../../binary";
const { uint16be, uint8, buffer, array } = types;

// 7.4.1.3.  Server Hello

export class ServerHello {
  msgType = HandshakeType.certificate;
  messageSeq: number;
  static readonly spec = {
    serverVersion: { major: uint8, minor: uint8 },
    random: Random,
    sessionId: buffer(uint8),
    cipherSuite: uint16be,
    compressionMethod: uint8,
    extensions: ExtensionList,
  };

  constructor(
    public serverVersion: { major: number; minor: number },
    public random: { gmt_unix_time: number; random_bytes: Buffer },
    public sessionId: Buffer,
    public cipherSuite: number,
    public compressionMethod: number,
    public extensions: any
  ) {}

  static createEmpty() {
    return new ServerHello(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  static deSerialize(buf: Buffer) {
    return new ServerHello(
      //@ts-ignore
      ...Object.values(decode(buf, ServerHello.spec))
    );
  }

  serialize() {
    const res = encode(this, ServerHello.spec).slice();
    return Buffer.from(res);
  }
}
