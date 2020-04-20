import { encode, types, decode } from "binary-data";
import { DtlsPlaintextHeader } from "./header";

export class DtlsPlaintext {
  static readonly spec = {
    recordLayerHeader: DtlsPlaintextHeader.spec,
    fragment: types.buffer(
      (context: {
        current: { recordLayerHeader: typeof DtlsPlaintextHeader.spec };
      }) => context.current.recordLayerHeader.contentLen
    ),
  };

  constructor(
    public recordLayerHeader: typeof DtlsPlaintext.spec.recordLayerHeader,
    public fragment: typeof DtlsPlaintext.spec.fragment
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
