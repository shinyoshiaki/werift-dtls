import { createSocket, RemoteInfo } from "dgram";
import { flight1 } from "./flight/client/flight1";
import { DtlsContext } from "./context/client";
import { UdpContext } from "./context/udp";
import { parsePacket } from "./record/receive";
import { HandshakeType } from "./handshake/const";
import { FragmentedHandshake } from "./record/message/fragment";
import { RecordContext } from "./context/record";
import { createPlaintext } from "./record/builder";
import { ContentType } from "./record/const";
import { CipherContext } from "./context/cipher";
import { ClientHello } from "./handshake/message/client/hello";
import { flight2 } from "./flight/server/flight2";
import { flight4 } from "./flight/server/flight4";

type Options = RemoteInfo;

export class DtlsServer {
  onConnect?: () => void;

  udp = new UdpContext(createSocket("udp4"), this.options);
  client = new DtlsContext();
  record = new RecordContext();
  cipher = new CipherContext();
  constructor(private options: Partial<Options> = {}) {
    this.udp.socket.bind(options.port);
    this.udp.socket.on("message", this.udpOnMessage);
    this.udpOnListening();
  }

  private udpOnListening = () => {
    flight1(this.udp, this.client, this.record, this.cipher);
  };

  private serverHelloBuffer: FragmentedHandshake[] = [];
  private udpOnMessage = (data: Buffer) => {
    const messages = parsePacket(this.client, this.cipher)(data);
    switch (messages[messages.length - 1].type) {
      case ContentType.handshake:
        {
          this.handleHandshakes(
            messages.map((v) => v.data as FragmentedHandshake).filter((v) => v)
          );
        }
        break;
      case ContentType.applicationData:
        {
          console.log(messages[0].data?.toString());
        }
        break;
    }
  };

  handleHandshakes(handshakes: FragmentedHandshake[]) {
    switch (handshakes[handshakes.length - 1].msg_type) {
      case HandshakeType.client_hello:
        {
          const clientHello = ClientHello.deSerialize(handshakes[0].fragment);
          if (this.client.flight === 1) {
            flight2(
              this.udp,
              this.client,
              this.record,
              this.cipher
            )(clientHello);
          } else {
            flight4(
              this.udp,
              this.client,
              this.record,
              this.cipher
            )(clientHello);
          }
        }
        break;
    }
  }

  send(buf: Buffer) {
    const pkt = createPlaintext(this.client)(
      [{ type: ContentType.applicationData, fragment: buf }],
      ++this.record.recordSequenceNumber
    )[0];
    this.udp.send(this.cipher.encryptPacket(pkt).serialize());
  }

  close() {
    this.udp.socket.close();
  }
}
