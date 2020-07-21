import { encode, types, decode } from "binary-data";

export class UseSRTP {
  static type = 14; // 9.  IANA Considerations
  static readonly spec = {
    type: types.uint16be,
    mkiLength: types.uint16be,
    profileLength: types.uint16be,
    profiles: types.array(
      types.uint16be,
      (ctx: any) => ctx.current.profileLength / 2
    ),
    mki: types.buffer((ctx: any) => {
      const v = ctx.current.mkiLength - ctx.current.profileLength - 2;
      return v;
    }),
  };
  type: number = UseSRTP.type;
  mkiLength: number = 0;
  profileLength: number = 0;
  profiles: number[] = [];
  mki: Buffer = Buffer.from([]);

  constructor(props: Partial<UseSRTP> = {}) {
    Object.assign(this, props);
  }

  static createEmpty() {
    const v = new UseSRTP();
    return v;
  }

  static deSerialize(buf: Buffer) {
    return new UseSRTP(decode(buf, UseSRTP.spec));
  }

  serialize() {
    const res = encode(this, UseSRTP.spec).slice();
    return Buffer.from(res);
  }
}
