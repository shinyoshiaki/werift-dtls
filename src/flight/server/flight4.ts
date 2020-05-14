import { createFragments, createPlaintext } from "../../record/builder";
import { UdpContext } from "../../context/udp";
import { DtlsContext } from "../../context/client";
import { RecordContext } from "../../context/record";
import { CipherContext } from "../../context/cipher";
import { ServerHello } from "../../handshake/message/server/hello";
import { Certificate } from "../../handshake/message/certificate";
import { generateKeySignature } from "../../cipher/x509";
import { ServerKeyExchange } from "../../handshake/message/server/keyExchange";
import { ServerHelloDone } from "../../handshake/message/server/helloDone";

export class Flight4 {
  constructor(
    private udp: UdpContext,
    private dtls: DtlsContext,
    private record: RecordContext,
    private cipher: CipherContext
  ) {}

  exec() {
    this.dtls.flight = 4;
    this.dtls.sequenceNumber = 1;

    this.sendServerHello();
    this.sendCertificate();
    this.sendKeyExchange();
    this.sendServerHelloDone();
  }

  sendServerHello() {
    const serverHello = new ServerHello(
      this.dtls.version,
      this.cipher.localRandom!,
      Buffer.from([0x00]),
      this.cipher.cipherSuite!,
      0,
      []
    );
    const fragments = createFragments(this.dtls)([serverHello]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    this.udp.send(buf);
  }

  sendCertificate() {
    // this.cipher.localPrivateKey = sign.key;
    // const certificate = new Certificate([Buffer.from(sign.pem)]);
    // const fragments = createFragments(this.dtls)([certificate]);
    // const packets = createPlaintext(this.dtls)(
    //   fragments,
    //   ++this.record.recordSequenceNumber
    // );
    // const buf = Buffer.concat(packets.map((v) => v.serialize()));
    // this.udp.send(buf);
  }

  sendKeyExchange() {
    const serverRandom = this.cipher.localRandom?.serialize()!;
    const clientRandom = this.cipher.remoteRandom?.serialize()!;
    const signature = generateKeySignature(
      clientRandom,
      serverRandom,
      this.cipher.localKeyPair?.publicKey!,
      this.cipher.namedCurve!,
      this.cipher.localPrivateKey!,
      "sha256"
    );
    const keyExchange = new ServerKeyExchange(
      Buffer.from([0, 3]),
      this.cipher.namedCurve!,
      this.cipher.localKeyPair?.privateKey.length!,
      this.cipher.localKeyPair?.privateKey!,
      4,
      Buffer.from([0, 1]),
      signature.length,
      Buffer.from(signature)
    );
    const fragments = createFragments(this.dtls)([keyExchange]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    this.udp.send(buf);
  }

  sendServerHelloDone() {
    const handshake = new ServerHelloDone();
    const fragments = createFragments(this.dtls)([handshake]);
    const packets = createPlaintext(this.dtls)(
      fragments,
      ++this.record.recordSequenceNumber
    );
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    this.udp.send(buf);
  }
}
