import { encode, types, decode } from "binary-data";

export class EllipticCurves {
  static readonly spec = {
    type: types.uint16be,
    data: types.array(types.uint16be, types.uint16be, "bytes"),
  };

  constructor(public type: number, public data: number[]) {
    this.type = 10;
  }

  static createEmpty() {
    const v = new EllipticCurves(undefined as any, undefined as any);
    return v;
  }

  static deSerialize(buf: Buffer) {
    return new EllipticCurves(
      //@ts-ignore
      ...Object.values(decode(buf, EllipticCurves.spec))
    );
  }

  serialize() {
    const res = encode(this, EllipticCurves.spec).slice();
    return Buffer.from(res);
  }
  get extension() {
    return {
      type: this.type,
      data: encode(this.data, EllipticCurves.spec.data).slice(),
    };
  }
}
