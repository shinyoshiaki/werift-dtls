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
  const hello = new ClientHello(
    { major: 255 - 1, minor: 255 - 2 },
    dtlsRandom(),
    Buffer.from([]),
    Buffer.from([]),
    [0xc02b, 0xc0ae, 0xc02b, 0xc02f, 0xc00a, 0xc014, 0xc0a4, 0xc0a8, 0x00a8],
    [0],
    [{ type: 23, data: Buffer.from([]) }]
  );
  const packets = createPackets(flight, record)([hello]);
  const buf = Buffer.concat(packets);
  udp.socket.send(buf, udp.rinfo.port, udp.rinfo.address);
  flight.version = hello.clientVersion;

  // response
  const msg = await new Promise<Buffer>((r) => udp.socket.once("message", r));
  const plaintext = DtlsPlaintext.deSerialize(msg);
  const handshake: FragmentedHandshake = FragmentedHandshake.deSerialize(
    plaintext.fragment
  );
  const verifyReq = ServerHelloVerifyRequest.deSerialize(handshake.fragment);
  return verifyReq;
};
