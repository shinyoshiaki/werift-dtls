import { encode, decode } from "binary-data";
import { HandshakeType } from "../../const";

// 7.4.5.  Server Hello Done

export class ServerHelloDone {
  msgType = HandshakeType.server_hello_done;
  messageSeq: number;
  static readonly spec = {};

  static createEmpty() {
    return new ServerHelloDone();
  }

  static deSerialize(buf: Buffer) {
    return new ServerHelloDone(
      //@ts-ignore
      ...Object.values(decode(buf, ServerHelloDone.spec))
    );
  }

  serialize() {
    const res = encode(this, ServerHelloDone.spec).slice();
    return Buffer.from(res);
  }
}
