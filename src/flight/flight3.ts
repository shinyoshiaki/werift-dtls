import { UdpContext } from "../context/udp";
import { ClientContext } from "../context/client";
import { ClientHello } from "../handshake/message/client/hello";
import { ServerHelloVerifyRequest } from "../handshake/message/server/helloVerifyRequest";
import { createPackets } from "../record/builder";
import { RecordContext } from "../context/record";
import { receive } from "../record/receive";
import { ServerHello } from "../handshake/message/server/hello";
import { ServerHelloDone } from "../handshake/message/server/helloDone";

export const flight3 = (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext
) => async (
  verifyReq: ServerHelloVerifyRequest
): Promise<[ServerHello, ServerHelloDone]> => {
  const hello = client.lastFlight[0] as ClientHello;
  hello.cookie = verifyReq.cookie;
  const packets = createPackets(client, record)([hello]);
  const buf = Buffer.concat(packets);
  udp.socket.send(buf, udp.rinfo.port, udp.rinfo.address);

  // response
  const msg = await new Promise<Buffer>((r) => udp.socket.once("message", r));
  const handshakes = receive(msg);
  const serverHello = ServerHello.deSerialize(handshakes[0].fragment);
  const serverHelloDone = ServerHelloDone.deSerialize(handshakes[1].fragment);
  return [serverHello, serverHelloDone];
};
