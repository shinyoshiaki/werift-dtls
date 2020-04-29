import { ClientHello } from "../handshake/message/client/hello";
import { dtlsRandom } from "../handshake/random";
import { createPackets } from "../record/builder";
import { DtlsPlaintext } from "../record/message/plaintext";
import { UdpContext } from "../context/udp";
import { ServerHelloVerifyRequest } from "../handshake/message/server/helloVerifyRequest";
import { FragmentedHandshake } from "../record/message/fragment";
import { ClientContext } from "../context/client";
import { RecordContext } from "../context/record";

export const flight1 = async (
  udp: UdpContext,
  flight: ClientContext,
  record: RecordContext
) => {
  const clientHello = new ClientHello(
    { major: 255 - 1, minor: 255 - 2 },
    dtlsRandom(),
    Buffer.from([]),
    Buffer.from([]),
    [139, 140, 141, 174, 175, 168, 169, 49316, 49317, 49320, 49321],
    [0],
    []
  );
  flight.version = clientHello.clientVersion;
  const packets = createPackets(flight, record)([clientHello]);
  const buf = Buffer.concat(packets);
  udp.socket.send(buf, udp.rinfo.port, udp.rinfo.address);

  // response
  const msg = await new Promise<Buffer>((r) => udp.socket.once("message", r));
  const plaintext = DtlsPlaintext.deSerialize(msg);
  const handshake: FragmentedHandshake = FragmentedHandshake.deSerialize(
    plaintext.fragment
  );
  const verifyReq = ServerHelloVerifyRequest.deSerialize(handshake.fragment);
  return verifyReq;
};
