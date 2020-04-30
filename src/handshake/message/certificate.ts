import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../const";
import { ASN11Cert } from "../binary";

// 7.4.2.  Server Certificate
// 7.4.6.  Client Certificate

export class Certificate {
  msgType = HandshakeType.certificate;
  messageSeq?: number;
  static readonly spec = {
    certificateList: types.array(ASN11Cert, types.uint24be, "bytes"),
  };

  constructor(public certificateList: Buffer[]) {}

  static createEmpty() {
    return new Certificate(undefined as any);
  }

  static deSerialize(buf: Buffer) {
    return new Certificate(
      //@ts-ignore
      ...Object.values(decode(buf, Certificate.spec))
    );
  }

  serialize() {
    const res = encode(this, Certificate.spec).slice();
    return Buffer.from(res);
  }
}
