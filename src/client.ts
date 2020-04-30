import { createSocket, RemoteInfo } from "dgram";
import { flight1 } from "./flight/flight1";
import { ClientContext } from "./context/client";
import { RecordContext } from "./context/record";
import { UdpContext } from "./context/udp";
import { receive } from "./record/receive";
import { ServerHelloVerifyRequest } from "./handshake/message/server/helloVerifyRequest";
import { flight3 } from "./flight/flight3";
import { ServerHello } from "./handshake/message/server/hello";
import { ServerHelloDone } from "./handshake/message/server/helloDone";
import { HandshakeType } from "./handshake/const";
import { Certificate } from "./handshake/message/certificate";
import { KeyExchange } from "./handshake/message/keyExchange";
import { flight5 } from "./flight/flight5";

export type Options = RemoteInfo;

export class DtlsClient {
  udp = new UdpContext(createSocket("udp4"), this.options);
  client = new ClientContext();
  record = new RecordContext();
  constructor(private options: Partial<Options> = {}) {
    this.udp.socket.on("message", this.udpOnMessage);
    this.udpOnListening();
  }

  private udpOnListening = () => {
    flight1(this.udp, this.client, this.record);
  };

  private udpOnMessage = (data: Buffer) => {
    const handshakes = receive(data);
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
          const messages = handshakes.map((handshake) => {
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
          flight5(messages);
        }
        break;
    }
  };
}
