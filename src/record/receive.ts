import { DtlsPlaintext } from "./message/plaintext";
import { FragmentedHandshake } from "./message/fragment";

export const receive = (data: Buffer) => {
  let start = 0;
  const packets = [];
  while (data.length > start) {
    const fragmentLength = data.readUInt16BE(start + 11);
    if (data.length < start + (12 + fragmentLength)) break;

    const type = data.readUInt8(start);
    const version = { major: 255 - 1, minor: 255 - 2 };
    const epoch = data.readUInt16BE(start + 3);
    const sequenceNumber = data.slice(start + 5, start + 11);
    const fragment = data.slice(start + 13, start + 13 + fragmentLength);

    const packet = new DtlsPlaintext(
      {
        contentType: type,
        protocolVersion: version,
        epoch: epoch,
        sequenceNumber: Number(sequenceNumber.toString()),
        contentLen: fragment.length,
      },
      fragment
    );

    packets.push(packet);

    start += 13 + fragmentLength;
  }

  return packets.map((p) => FragmentedHandshake.deSerialize(p.fragment));
};
