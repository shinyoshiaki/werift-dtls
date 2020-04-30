import { UdpContext } from "../context/udp";
import { ClientContext } from "../context/client";
import { ClientHello } from "../handshake/message/client/hello";
import { ServerHelloVerifyRequest } from "../handshake/message/server/helloVerifyRequest";
import { createPackets } from "../record/builder";
import { RecordContext } from "../context/record";

export const flight3 = (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext
) => async (verifyReq: ServerHelloVerifyRequest) => {
  const hello = client.lastFlight[0] as ClientHello;
  hello.cookie = verifyReq.cookie;
  const packets = createPackets(client, record)([hello]);
  const buf = Buffer.concat(packets);
  udp.socket.send(buf, udp.rinfo.port, udp.rinfo.address);
};
