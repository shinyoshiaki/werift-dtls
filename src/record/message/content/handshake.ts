import { encode, types, decode } from "binary-data";
import { HandshakeType } from "../../../handshake/const";
import { ClientHello } from "../../../handshake/message/client/hello";

export class Handshake {
  static readonly spec = {
    header: {
      handshakeType: types.uint8,
      length: types.uint24be,
      messageSequence: types.uint16be,
      fragmentOffset: types.uint24be,
      fragmentLength: types.uint24be,
    },
    message: types.select(
      types.when(({ node: { header: { handshakeType } } }: any) => {
        return handshakeType === HandshakeType.client_hello;
      }, ClientHello.spec),
      {}
    ),
  };

  constructor(
    public header: typeof Handshake.spec.header,
    public message: typeof ClientHello.spec
  ) {}

  static createEmpty() {
    return new Handshake(undefined, undefined);
  }

  static deSerialize(buf: Buffer) {
    return new Handshake(
      //@ts-ignore
      ...Object.values(decode(buf, Handshake.spec))
    );
  }

  serialize() {
    const header = Buffer.from(
      encode(this.header, Handshake.spec.header).slice()
    );
    const body = ClientHello.from(this.message);
    return Buffer.concat([header, body.serialize()]);
  }
}
