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
import { createFragments, createPackets } from "../record/builder";
import { RecordContext } from "../context/record";
import { UdpContext } from "../context/udp";
import { DtlsRandom } from "../handshake/random";
import { ContentType } from "../record/const";

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
    const packets = createPackets(client, record)(fragments);
    const buf = Buffer.concat(packets);
    client.bufferHandshake([clientKeyExchange]);
    udp.send(buf);
  }

  const changeCipherSpec = ChangeCipherSpec.createEmpty().serialize();
  {
    const packets = createPackets(
      client,
      record
    )([{ type: ContentType.changeCipherSpec, fragment: changeCipherSpec }]);
    const buf = Buffer.concat(packets);
    udp.send(buf);
  }

  const localVerifyData = prfVerifyDataClient(
    client.masterSecret!,
    Buffer.concat(client.handshakeCache)
  );

  const finish = new Finished(localVerifyData);
  const fragments = createFragments(client)([finish]);
  const packets = createPackets(client, record)(fragments);
  const buf = Buffer.concat(packets);
  // todo encrypt
  client.bufferHandshake([clientKeyExchange]);
  udp.send(buf);
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
};

handlers[HandshakeType.server_hello_done] = (client: ClientContext) => () => {};
