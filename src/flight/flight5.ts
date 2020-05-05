import { ServerHello } from "../handshake/message/server/hello";
import { Certificate } from "../handshake/message/certificate";
import { ServerHelloDone } from "../handshake/message/server/helloDone";
import { HandshakeType } from "../handshake/const";
import { ClientContext } from "../context/client";
import { ServerKeyExchange } from "../handshake/message/server/keyExchange";
import { generateKeyPair } from "../cipher/namedCurve";
import {
  prfPreMasterSecret,
  prfMasterSecret,
  prfVerifyDataClient,
} from "../cipher/prf";
import { ClientKeyExchange } from "../handshake/message/client/keyExchange";
import { ChangeCipherSpec } from "../handshake/message/changeCipherSpec";
import { Finished } from "../handshake/message/finished";
import { createFragments, createPlaintext } from "../record/builder";
import { RecordContext } from "../context/record";
import { UdpContext } from "../context/udp";
import { DtlsRandom } from "../handshake/random";
import { ContentType } from "../record/const";
import { EcdheEcdsaWithAes128GcmSha256 } from "../cipher/suite/ecdsaWithAes128GcmSha256";

export const flight5 = (
  udp: UdpContext,
  client: ClientContext,
  record: RecordContext
) => (
  messages: (ServerHello | Certificate | ServerKeyExchange | ServerHelloDone)[]
) => {
  messages.forEach((message) => {
    handlers[message.msgType](client)(message);
  });

  const clientKeyExchange = new ClientKeyExchange(
    client.localKeyPair?.publicKey!
  );
  {
    const fragments = createFragments(client)([clientKeyExchange]);
    const packets = createPlaintext(client, record)(fragments);
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    client.bufferHandshake([clientKeyExchange], true, 5);
    udp.send(buf);
  }

  const changeCipherSpec = ChangeCipherSpec.createEmpty().serialize();
  {
    const packets = createPlaintext(
      client,
      record
    )([{ type: ContentType.changeCipherSpec, fragment: changeCipherSpec }]);
    const buf = Buffer.concat(packets.map((v) => v.serialize()));
    udp.send(buf);
  }

  const cache = Buffer.concat(client.handshakeCache.map((v) => v.data));
  const localVerifyData = prfVerifyDataClient(client.masterSecret!, cache);
  const finish = new Finished(localVerifyData);
  const fragments = createFragments(client)([finish]);
  client.epoch = 1;
  record.recordSequenceNumber = 0;
  const packets = createPlaintext(client, record)(fragments);
  const buf = Buffer.concat(
    packets.map((pkt) => {
      let raw = pkt.serialize();
      raw = client.cipher?.cryptoGCM?.encrypt(
        raw,
        pkt.recordLayerHeader as any,
        true
      )!;
      return raw;
    })
  );
  udp.send(buf);

  client.flight = 5;
};

const handlers: {
  [key: number]: (client: ClientContext) => (message: any) => void;
} = {};

handlers[HandshakeType.server_hello] = (client: ClientContext) => (
  message: ServerHello
) => {
  client.remoteRandom = DtlsRandom.from(message.random);
  client.cipherSuite = message.cipherSuite;
};

handlers[HandshakeType.certificate] = (client: ClientContext) => (
  message: Certificate
) => {
  client.remoteCertificate = message.certificateList[0];
};

handlers[HandshakeType.server_key_exchange] = (client: ClientContext) => (
  message: ServerKeyExchange
) => {
  client.remoteKeyPair = {
    curve: message.namedCurve,
    publicKey: message.publicKey,
  };
  client.localKeyPair = generateKeyPair(message.namedCurve);
  const preMasterSecret = prfPreMasterSecret(
    client.remoteKeyPair.publicKey!,
    client.localKeyPair?.privateKey!,
    client.localKeyPair?.curve!
  )!;
  client.masterSecret = prfMasterSecret(
    preMasterSecret,
    client.localRandom?.serialize()!,
    client.remoteRandom?.serialize()!
  );

  client.cipher = new EcdheEcdsaWithAes128GcmSha256();
  client.cipher.init(
    client.masterSecret,
    client.localRandom?.serialize()!,
    client.remoteRandom?.serialize()!,
    true
  );
};

handlers[HandshakeType.server_hello_done] = (client: ClientContext) => (
  message: ServerHelloDone
) => {
  message.messageSeq;
};
