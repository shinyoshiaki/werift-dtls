import { encode, types, decode } from "binary-data";
import { DtlsPlaintextHeader } from "./header";
import { contentType } from "../const";
import { ChangeCipherSpec } from "../../handshake/message/changeCipherSpec";
import { FragmentedHandshake } from "./fragment";
import { Alert } from "../../handshake/message/alert";

export class DtlsPlaintext {
  static readonly spec = {
    recordLayerHeader: DtlsPlaintextHeader.spec,
    fragment: types.select(
      types.when(
        ({ node }: any) =>
          node.recordLayerHeader.contentType === contentType.changeCipherSpec,
        ChangeCipherSpec.spec
      ),
      types.when(
        ({ node }: any) =>
          node.recordLayerHeader.contentType === contentType.alert,
        Alert.spec
      ),
      types.when(
        ({ node }: any) =>
          node.recordLayerHeader.contentType === contentType.handshake,
        FragmentedHandshake.spec
      ),
      {}
    ),
  };

  constructor(
    public recordLayerHeader: typeof DtlsPlaintext.spec.recordLayerHeader,
    public fragment: FragmentedHandshake | ChangeCipherSpec
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
        case contentType.handshake:
          return FragmentedHandshake.spec;
      }
    })();
    const res = encode(this, {
      ...DtlsPlaintext.spec,
      fragment,
    }).slice();
    return Buffer.from(res);
  }
}
