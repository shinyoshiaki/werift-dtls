import { DtlsPlaintext } from "./message/plaintext";
import { FragmentedHandshake } from "./message/fragment";
import { ClientContext } from "../context/client";
import { CipherContext } from "../context/cipher";

export const parsePacket = (client: ClientContext, cipher: CipherContext) => (
  data: Buffer
) => {
  let start = 0;
  const packets = [];
  while (data.length > start) {
    const fragmentLength = data.readUInt16BE(start + 11);
    if (data.length < start + (12 + fragmentLength)) break;
    const packet = DtlsPlaintext.deSerialize(data.slice(start));

    packets.push(packet);

    start += 13 + fragmentLength;
  }

  const handshakes = packets
    .map((p) => {
      if (p.fragment.length <= 1)
        return (undefined as any) as FragmentedHandshake;
      let raw = p.fragment;
      if (client.flight === 5) {
        raw = cipher.decryptPacket(p);
      }
      return FragmentedHandshake.deSerialize(raw);
    })
    .filter((v) => v);

  return handshakes;
};
