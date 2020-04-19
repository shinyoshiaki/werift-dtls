import { encode, types, decode } from "binary-data";

// 7.4.9.  Finished

export class Finished {
  static readonly spec = {
    verifyData: types.buffer(15),
  };

  constructor(public verifyData: Buffer) {}

  static createEmpty() {
    return new Finished(undefined);
  }

  static deSerialize(buf: Buffer) {
    return new Finished(
      //@ts-ignore
      ...Object.values(decode(buf, Finished.spec))
    );
  }

  serialize() {
    const res = encode(this, Finished.spec).slice();
    return Buffer.from(res);
  }
}
