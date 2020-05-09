import { UdpContext } from "../context/udp";
import { ClientContext } from "../context/client";
import { ClientHello } from "../handshake/message/client/hello";
import { ServerHelloVerifyRequest } from "../handshake/message/server/helloVerifyRequest";
import { createFragments, createPlaintext } from "../record/builder";
import { RecordContext } from "../context/record";

export const flight3 = (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext
) => async (verifyReq: ServerHelloVerifyRequest) => {
  const hello = client.lastFlight[0] as ClientHello;
  hello.cookie = verifyReq.cookie;
  const fragments = createFragments(client)([hello]);
  const packets = createPlaintext(client)(
    fragments,
    ++record.recordSequenceNumber
  );
  const buf = Buffer.concat(packets.map((v) => v.serialize()));
  client.bufferHandshake(
    Buffer.concat(fragments.map((v) => v.fragment)),
    true,
    3
  );
  udp.send(buf);
};
