import { UdpContext } from "../context/udp";
import { ClientContext } from "../context/client";
import { ClientHello } from "../handshake/message/client/hello";
import { ServerHelloVerifyRequest } from "../handshake/message/server/helloVerifyRequest";
import { createFragments, createPackets } from "../record/builder";
import { RecordContext } from "../context/record";

export const flight3 = (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext
) => async (verifyReq: ServerHelloVerifyRequest) => {
  const hello = client.lastFlight[0] as ClientHello;
  hello.cookie = verifyReq.cookie;

  client.bufferHandshake([hello]);

  const fragments = createFragments(client)([hello]);
  const packets = createPackets(client, record)(fragments);
  const buf = Buffer.concat(packets);
  udp.socket.send(buf, udp.rinfo.port, udp.rinfo.address);
};
