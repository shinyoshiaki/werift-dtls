export class SrtpContext {
  srtpProfile?: number;

  static findMatchingSRTPProfile(a: number[], b: number[]) {
    for (const v of a) {
      if (b.includes(v)) return v;
    }
  }
}
