import { encode, types, decode } from "binary-data";

export class FragmentedHandshake {
  static readonly spec = {
    msg_type: types.uint8,
    length: types.uint24be,
    message_seq: types.uint16be,
    fragment_offset: types.uint24be,
    fragment_length: types.uint24be,
    fragment: types.buffer((context: any) => context.current.length),
  };

  constructor(
    public msg_type: number,
    public length: number,
    public message_seq: number,
    public fragment_offset: number,
    public fragment_length: number,
    public fragment: Buffer
  ) {}

  static createEmpty() {
    return new FragmentedHandshake(
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any,
      undefined as any
    );
  }

  static deSerialize(buf: Buffer) {
    return new FragmentedHandshake(
      //@ts-ignore
      ...Object.values(decode(buf, FragmentedHandshake.spec))
    );
  }

  serialize() {
    const res = encode(this, FragmentedHandshake.spec).slice();
    return Buffer.from(res);
  }

  chunk(maxFragmentLength?: number): FragmentedHandshake[] {
    let start = 0;
    const totalLength = this.fragment.length;

    const fragments: FragmentedHandshake[] = [];
    if (!maxFragmentLength) {
      maxFragmentLength = 1280 - (20 + 8) - (1 + 3 + 2 + 3 + 3);
    }
    // loop through the message and fragment it
    while (!fragments.length && start < totalLength) {
      // calculate maximum length, limited by MTU - IP/UDP headers - handshake overhead
      const fragmentLength = Math.min(maxFragmentLength, totalLength - start);
      // slice and dice
      const data = Buffer.from(
        this.fragment.slice(start, start + fragmentLength)
      );
      if (data.length <= 0) {
        // this shouldn't happen, but we don't want to introduce an infinite loop
        throw new Error(
          `Zero or less bytes processed while fragmenting handshake message.`
        );
      }
      // create the message
      fragments.push(
        new FragmentedHandshake(
          this.msg_type,
          totalLength,
          this.message_seq,
          start,
          data.length,
          data
        )
      );
      // step forward by the actual fragment length
      start += data.length;
    }

    return fragments;
  }
}
