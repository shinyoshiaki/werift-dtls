import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../const";
import { Random, ProtocolVersion } from "../../binary";

// 7.4.1.3.  Server Hello

export class ServerHello {
  msgType = HandshakeType.server_hello;
  messageSeq?: number;
  static readonly spec = {
    serverVersion: ProtocolVersion,
    random: Random,
    sessionId: types.buffer(types.uint8),
    cipherSuite: types.uint16be,
    compressionMethod: types.uint8,
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
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any
    );
  }

  static deSerialize(buf: Buffer) {
    const res = decode(buf, ServerHello.spec);
    return new ServerHello(
      //@ts-ignore
      ...Object.values(res)
    );
  }

  static deSerializeWithExtensions(buf: Buffer) {
    const res = decode(buf, {
      ...ServerHello.spec,
      extensions: types.buffer(types.uint16be),
    });
    return new ServerHello(
      //@ts-ignore
      ...Object.values(res)
    );
  }

  serialize() {
    const res = encode(this, ServerHello.spec).slice();
    return Buffer.from(res);
  }

  serializeWithExtensions() {
    const res = encode(this, {
      ...ServerHello.spec,
      extensions: types.buffer(types.uint16be),
    }).slice();
    return Buffer.from(res);
  }
}
