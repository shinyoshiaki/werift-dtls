import { encode, types, decode } from "binary-data";

export class EllipticCurves {
  static type = 10;
  static readonly spec = {
    type: types.uint16be,
    data: types.array(types.uint16be, types.uint16be, "bytes"),
  };

  constructor(public type: number, public data: number[]) {
    this.type = EllipticCurves.type;
  }

  static createEmpty() {
    const v = new EllipticCurves(undefined as any, undefined as any);
    return v;
  }

  static fromData(buf: Buffer) {
    return new EllipticCurves(
      EllipticCurves.type,
      decode(buf, EllipticCurves.spec.data)
    );
  }

  get extension() {
    return {
      type: this.type,
      data: Buffer.from(encode(this.data, EllipticCurves.spec.data).slice()),
    };
  }
}
