import { ServerHello } from "../handshake/message/server/hello";
import { Certificate } from "../handshake/message/certificate";
import { KeyExchange } from "../handshake/message/keyExchange";
import { ServerHelloDone } from "../handshake/message/server/helloDone";
import { HandshakeType } from "../handshake/const";
import { ClientContext } from "../context/client";

export const flight5 = (client: ClientContext) => (
  messages: (ServerHello | Certificate | KeyExchange | ServerHelloDone)[]
) => {
  messages.forEach((message) => {
    handlers[message.msgType](client)(message);
  });
};

const handlers: {
  [key: number]: (client: ClientContext) => (message: any) => void;
} = {};

handlers[HandshakeType.server_hello] = (client: ClientContext) => (
  message: ServerHello
) => {
  client.random = message.random;
  client.cipherSuite = message.cipherSuite;
};

handlers[HandshakeType.certificate] = (client: ClientContext) => (
  message: Certificate
) => {
  client.remoteCertificate = message.certificateList[0];
};

handlers[HandshakeType.server_key_exchange] = (client: ClientContext) => (
  message: KeyExchange
) => {};
