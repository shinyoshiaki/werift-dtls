import { ClientHello } from "../handshake/message/client/hello";
import { contentType } from "./const";
import { DtlsPlaintext } from "./message/plaintext";
import { ClientContext } from "../context/client";
import { RecordContext } from "../context/record";

export const createPackets = (client: ClientContext, record: RecordContext) => (
  handshakes: ClientHello[]
) => {
  client.lastFlight = handshakes;

  const fragments = handshakes
    .map((handshake) => {
      handshake.messageSeq = ++client.lastSentSeqNum;
      const fragment = handshake.toFragment();
      const fragments = fragment.chunk().map((f) => ({
        type: contentType.handshake,
        fragmentData: f.serialize(),
        fragment: f,
      }));
      return fragments;
    })
    .flatMap((v) => v);

  return fragments.map((msg) => {
    const packet = new DtlsPlaintext(
      {
        contentType: msg.type,
        protocolVersion: client.version,
        epoch: 0,
        sequenceNumber: record.recordSequenceNumber++,
        contentLen: msg.fragmentData.length,
      },
      msg.fragment
    );
    const buf = packet.serialize();
    return buf;
  });
};
