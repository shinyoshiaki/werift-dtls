import { DtlsPlaintext } from "./message/plaintext";
import { FragmentedHandshake } from "./message/fragment";

export const receive = (data: Buffer) => {
  let start = 0;
  const packets = [];
  while (data.length > start) {
    const fragmentLength = data.readUInt16BE(start + 11);
    if (data.length < start + (12 + fragmentLength)) break;
    const packet = DtlsPlaintext.deSerialize(data.slice(start));

    packets.push(packet);

    start += 13 + fragmentLength;
  }

  const handshakes = packets.map((p) => {
    return FragmentedHandshake.deSerialize(p.fragment);
  });
  return handshakes;
};
