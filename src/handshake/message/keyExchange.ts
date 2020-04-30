import { encode, decode, types } from "binary-data";
import { HandshakeType } from "../const";

// 7.4.7.  Client Key Exchange Message

export class KeyExchange {
  msgType = HandshakeType.client_key_exchange;
  messageSeq?: number;
  static readonly spec = { rawData: types.buffer(types.uint8) };

  constructor(public rawData: Buffer) {}

  static createEmpty() {
    return new KeyExchange(undefined as any);
  }

  static deSerialize(buf: Buffer) {
    return new KeyExchange(
      //@ts-ignore
      ...Object.values(decode(buf, KeyExchange.spec))
    );
  }

  serialize() {
    const res = encode(this, KeyExchange.spec).slice();
    return Buffer.from(res);
  }
}
