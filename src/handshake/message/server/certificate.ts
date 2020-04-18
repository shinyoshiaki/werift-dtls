import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../const";
import { ASN11Cert } from "../../binary";

// 7.4.2.  Server Certificate

export class ServerCertificate {
  msgType = HandshakeType.certificate;
  messageSeq: number;
  static readonly spec = {
    certificateList: types.array(ASN11Cert, types.uint24be, "bytes"),
  };

  constructor(public certificateList: Buffer[]) {}

  static createEmpty() {
    return new ServerCertificate(undefined);
  }

  static deSerialize(buf: Buffer) {
    return new ServerCertificate(
      //@ts-ignore
      ...Object.values(decode(buf, ServerCertificate.spec))
    );
  }

  serialize() {
    const res = encode(this, ServerCertificate.spec).slice();
    return Buffer.from(res);
  }
}
