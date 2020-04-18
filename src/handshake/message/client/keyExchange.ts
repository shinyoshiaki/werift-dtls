import { encode, decode, types } from "binary-data";
import { HandshakeType } from "../../const";

// 7.4.7.  Client Key Exchange Message

export class ClientKeyExchange {
  msgType = HandshakeType.client_key_exchange;
  messageSeq: number;
  static readonly spec = { rawData: types.buffer(types.uint8) };

  constructor(public rawData: Buffer) {}

  static createEmpty() {
    return new ClientKeyExchange(undefined);
  }

  static deSerialize(buf: Buffer) {
    return new ClientKeyExchange(
      //@ts-ignore
      ...Object.values(decode(buf, ClientKeyExchange.spec))
    );
  }

  serialize() {
    const res = encode(this, ClientKeyExchange.spec).slice();
    return Buffer.from(res);
  }
}
