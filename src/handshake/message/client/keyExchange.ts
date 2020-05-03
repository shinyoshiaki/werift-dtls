import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../const";
import { Handshake } from "../../../typings/domain";

export class ClientKeyExchange implements Handshake {
  msgType = HandshakeType.client_key_exchange;

  static readonly spec = {
    publicKey: types.buffer(types.uint8),
  };

  constructor(public publicKey: Buffer) {}

  static createEmpty() {
    return new ClientKeyExchange(undefined as any);
  }

  static deSerialize(buf: Buffer) {
    const res = decode(buf, ClientKeyExchange.spec);
    return new ClientKeyExchange(
      //@ts-ignore
      ...Object.values(res)
    );
  }

  serialize() {
    const res = encode(this, ClientKeyExchange.spec).slice();
    return Buffer.from(res);
  }
}
