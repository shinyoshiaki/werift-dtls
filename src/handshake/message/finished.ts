import { encode, types, decode } from "binary-data";
import { Handshake } from "../../typings/domain";
import { HandshakeType } from "../const";
import { FragmentedHandshake } from "../../record/message/fragment";

// 7.4.9.  Finished

export class Finished implements Handshake {
  msgType = HandshakeType.finished;
  messageSeq?: number;
  static readonly spec = {
    verifyData: types.buffer(types.uint16be),
  };

  constructor(public verifyData: Buffer) {}

  static createEmpty() {
    return new Finished(undefined as any);
  }

  static deSerialize(buf: Buffer) {
    return new Finished(
      //@ts-ignore
      ...Object.values(decode(buf, Finished.spec))
    );
  }

  serialize() {
    const res = encode(this, Finished.spec).slice();
    return Buffer.from(res);
  }

  toFragment() {
    const body = this.serialize();
    return new FragmentedHandshake(
      this.msgType,
      body.length,
      this.messageSeq!,
      0,
      body.length,
      body
    );
  }
}
