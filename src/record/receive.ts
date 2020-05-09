import { DtlsPlaintext } from "./message/plaintext";
import { FragmentedHandshake } from "./message/fragment";
import { ClientContext } from "../context/client";
import { CipherContext } from "../context/cipher";
import { ContentType } from "./const";

export const parsePacket = (client: ClientContext, cipher: CipherContext) => (
  data: Buffer
) => {
  let start = 0;
  const packets: DtlsPlaintext[] = [];
  while (data.length > start) {
    const fragmentLength = data.readUInt16BE(start + 11);
    if (data.length < start + (12 + fragmentLength)) break;
    const packet = DtlsPlaintext.deSerialize(data.slice(start));

    packets.push(packet);

    start += 13 + fragmentLength;
  }

  const results = packets.map((p) => {
    switch (p.recordLayerHeader.contentType) {
      case ContentType.changeCipherSpec: {
        return { type: ContentType.changeCipherSpec, data: undefined };
      }
      case ContentType.handshake: {
        let raw = p.fragment;
        if (client.flight === 5) {
          raw = cipher.decryptPacket(p);
        }
        return {
          type: ContentType.handshake,
          data: FragmentedHandshake.deSerialize(raw),
        };
      }
      case ContentType.applicationData: {
        return {
          type: ContentType.applicationData,
          data: cipher.decryptPacket(p),
        };
      }
      case ContentType.alert: {
        console.log("ContentType.alert", p);
        return { type: ContentType.alert, data: undefined };
      }
      default: {
        console.log("default", p);
        return { type: ContentType.alert, data: undefined };
      }
    }
  });

  return results;
};
