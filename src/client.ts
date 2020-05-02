import { createSocket, RemoteInfo } from "dgram";
import { flight1 } from "./flight/flight1";
import { ClientContext } from "./context/client";
import { RecordContext } from "./context/record";
import { UdpContext } from "./context/udp";
import { parsePacket } from "./record/receive";
import { ServerHelloVerifyRequest } from "./handshake/message/server/helloVerifyRequest";
import { flight3 } from "./flight/flight3";
import { ServerHello } from "./handshake/message/server/hello";
import { ServerHelloDone } from "./handshake/message/server/helloDone";
import { HandshakeType } from "./handshake/const";
import { Certificate } from "./handshake/message/certificate";
import { KeyExchange } from "./handshake/message/keyExchange";
import { flight5 } from "./flight/flight5";
import { ServerContext } from "./context/server";
import { FragmentedHandshake } from "./record/message/fragment";

export type Options = RemoteInfo;

export class DtlsClient {
  udp = new UdpContext(createSocket("udp4"), this.options);
  client = new ClientContext();
  record = new RecordContext();
  server = new ServerContext();
  constructor(private options: Partial<Options> = {}) {
    this.udp.socket.on("message", this.udpOnMessage);
    this.udpOnListening();
  }

  private udpOnListening = () => {
    flight1(this.udp, this.client, this.record);
  };

  private serverHelloBuffer: FragmentedHandshake[] = [];
  private udpOnMessage = (data: Buffer) => {
    const handshakes = parsePacket(data);

    if (handshakes[0].msg_type === HandshakeType.server_hello) {
      this.serverHelloBuffer = handshakes;
    }
    if (this.serverHelloBuffer.length > 0) {
      this.serverHelloBuffer = [...this.serverHelloBuffer, ...handshakes];
    }

    switch (handshakes[handshakes.length - 1].msg_type) {
      case HandshakeType.hello_verify_request:
        {
          const verifyReq = ServerHelloVerifyRequest.deSerialize(
            handshakes[0].fragment
          );
          flight3(this.udp, this.client, this.record)(verifyReq);
        }
        break;
      case HandshakeType.server_hello_done:
        {
          const handshakes = [
            HandshakeType.server_hello,
            HandshakeType.certificate,
            HandshakeType.server_key_exchange,
            HandshakeType.certificate_request,
            HandshakeType.server_hello_done,
          ]
            .map((type) => {
              const fragments = FragmentedHandshake.findAllFragments(
                this.serverHelloBuffer,
                type
              );
              if (fragments.length === 0)
                return (undefined as any) as FragmentedHandshake;
              return FragmentedHandshake.assemble(fragments);
            })
            .filter((v) => v);
          this.serverHelloBuffer = [];

          const messages = handshakes.map((handshake, _) => {
            switch (handshake.msg_type) {
              case HandshakeType.server_hello:
                return ServerHello.deSerialize(handshake.fragment);
              case HandshakeType.certificate:
                return Certificate.deSerialize(handshake.fragment);
              case HandshakeType.server_key_exchange:
                return KeyExchange.deSerialize(handshake.fragment);
              case HandshakeType.server_hello_done:
                return ServerHelloDone.deSerialize(handshake.fragment);
            }
          });
          flight5(this.server)(messages);
        }
        break;
    }
  };
}
