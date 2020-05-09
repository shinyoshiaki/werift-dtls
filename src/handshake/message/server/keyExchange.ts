import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../const";
import { Handshake } from "../../../typings/domain";
import { FragmentedHandshake } from "../../../record/message/fragment";

export class ServerKeyExchange implements Handshake {
  msgType = HandshakeType.server_key_exchange;
  messageSeq?: number;

  static readonly spec = {
    ellipticCurveType: types.buffer(2),
    namedCurve: types.uint8,
    publicKeyLength: types.uint8,
    publicKey: types.buffer((ctx: any) => ctx.current.publicKeyLength),
    hashAlgorithm: types.uint8,
    signatureAlgorithm: types.buffer(2),
    signatureLength: types.uint8,
    signature: types.buffer((ctx: any) => ctx.current.signatureLength),
  };

  constructor(
    public ellipticCurveType: Buffer,
    public namedCurve: number,
    public publicKeyLength: number,
    public publicKey: Buffer,
    public hashAlgorithm: number,
    public signatureAlgorithm: Buffer,
    public signatureLength: number,
    public signature: Buffer
  ) {}

  static createEmpty() {
    return new ServerKeyExchange(
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any
    );
  }

  static deSerialize(buf: Buffer) {
    const res = decode(buf, ServerKeyExchange.spec);
    return new ServerKeyExchange(
      //@ts-ignore
      ...Object.values(res)
    );
  }

  serialize() {
    const res = encode(this, ServerKeyExchange.spec).slice();
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
