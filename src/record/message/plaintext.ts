import { encode, types, decode } from "binary-data";
import { DtlsPlaintextHeader } from "./header";
import { Handshake } from "./content/handshake";
import { contentType } from "../const";
import { ChangeCipherSpec } from "../../handshake/message/changeCipherSpec";

export class DtlsPlaintext {
  static readonly spec = {
    recordLayerHeader: DtlsPlaintextHeader.spec,
    fragment: types.select(
      types.when(
        ({ node }: any) =>
          node.recordLayerHeader.contentType === contentType.changeCipherSpec,
        ChangeCipherSpec.spec
      ),
      {}
    ),
  };

  constructor(
    public recordLayerHeader: typeof DtlsPlaintext.spec.recordLayerHeader,
    public fragment: Handshake | ChangeCipherSpec
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
    const fragment = (() => {
      switch (this.recordLayerHeader.contentType) {
        case contentType.changeCipherSpec:
          return ChangeCipherSpec.spec;
      }
    })();
    const res = encode(this, {
      ...DtlsPlaintext.spec,
      fragment,
    }).slice();
    return Buffer.from(res);
  }
}
