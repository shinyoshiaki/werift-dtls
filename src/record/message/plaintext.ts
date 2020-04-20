import { encode, types, decode } from "binary-data";
import { DtlsPlaintextHeader } from "./header";

export class DtlsPlaintext {
  static readonly spec = {
    recordLayerHeader: DtlsPlaintextHeader.spec,
    content: { contentType: types.uint8 },
  };

  constructor(
    public recordLayerHeader: typeof DtlsPlaintext.spec.recordLayerHeader,
    public content: typeof DtlsPlaintext.spec.content
  ) {}

  static createEmpty() {
    return new DtlsPlaintext(undefined, undefined);
  }

  static deSerialize(buf: Buffer) {
    return new DtlsPlaintext(
      //@ts-ignore
      ...Object.values(decode(buf, DtlsPlaintext.spec))
    );
  }

  serialize() {
    const res = encode(this, DtlsPlaintext.spec).slice();
    return Buffer.from(res);
  }
}
