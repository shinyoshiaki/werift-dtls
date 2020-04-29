import { encode, types, decode } from "binary-data";
import { DtlsPlaintextHeader } from "./header";

export class DtlsPlaintext {
  static readonly spec = {
    recordLayerHeader: DtlsPlaintextHeader.spec,
    fragment: types.buffer(
      (context: any) => context.current.recordLayerHeader.contentLen
    ),
  };

  constructor(
    public recordLayerHeader: typeof DtlsPlaintext.spec.recordLayerHeader,
    public fragment: Buffer
  ) {}

  static createEmpty() {
    return new DtlsPlaintext(undefined, undefined);
  }

  static deSerialize(buf: Buffer) {
    const r = new DtlsPlaintext(
      //@ts-ignore
      ...Object.values(decode(buf, DtlsPlaintext.spec))
    );
    return r;
  }

  serialize() {
    const res = encode(this, DtlsPlaintext.spec).slice();
    return Buffer.from(res);
  }
}
