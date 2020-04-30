import { encode, decode, types } from "binary-data";
import { HandshakeType } from "../../const";
import { ProtocolVersion } from "../../binary";

// 4.2.1.  Denial-of-Service Countermeasures

export class ServerHelloVerifyRequest {
  msgType = HandshakeType.hello_verify_request;
  messageSeq?: number;
  static readonly spec = {
    serverVersion: ProtocolVersion,
    cookie: types.buffer(types.uint8),
  };

  constructor(
    public serverVersion: { major: number; minor: number },
    public cookie: Buffer
  ) {}

  static createEmpty() {
    return new ServerHelloVerifyRequest(undefined as any, undefined as any);
  }

  static deSerialize(buf: Buffer) {
    return new ServerHelloVerifyRequest(
      //@ts-ignore
      ...Object.values(decode(buf, ServerHelloVerifyRequest.spec))
    );
  }

  serialize() {
    const res = encode(this, ServerHelloVerifyRequest.spec).slice();
    return Buffer.from(res);
  }

  get version() {
    return {
      major: 255 - this.serverVersion.major,
      minor: 255 - this.serverVersion.minor,
    };
  }
}
