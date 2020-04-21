import { encode, types, decode } from "binary-data";
import { ProtocolVersion } from "../../handshake/binary";

export class DtlsPlaintextHeader {
  static readonly spec = {
    contentType: types.uint8,
    protocolVersion: ProtocolVersion,
    epoch: types.uint16be,
    sequenceNumber: types.uint48be,
    contentLen: types.uint16be,
  };

  constructor(
    public contentType: number,
    public contentLen: number,
    public protocolVersion: { major: number; minor: number },
    public epoch: number,
    public sequenceNumber: number
  ) {}

  static createEmpty() {
    return new DtlsPlaintextHeader(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  static deSerialize(buf: Buffer) {
    return new DtlsPlaintextHeader(
      //@ts-ignore
      ...Object.values(decode(buf, DtlsPlaintextHeader.spec))
    );
  }

  serialize() {
    const res = encode(this, DtlsPlaintextHeader.spec).slice();
    return Buffer.from(res);
  }
}