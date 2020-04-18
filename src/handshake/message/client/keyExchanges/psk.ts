import { encode, decode, types } from "binary-data";

// 7.4.7.  Client Key Exchange Message

export class ClientKeyExchangePsk {
  static readonly spec = { pskIdentity: types.buffer(types.uint16be) };

  constructor(public pskIdentity: Buffer) {}

  static createEmpty() {
    return new ClientKeyExchangePsk(undefined);
  }

  static deSerialize(buf: Buffer) {
    return new ClientKeyExchangePsk(
      //@ts-ignore
      ...Object.values(decode(buf, ClientKeyExchangePsk.spec))
    );
  }

  serialize() {
    const res = encode(this, ClientKeyExchangePsk.spec).slice();
    return Buffer.from(res);
  }
}
