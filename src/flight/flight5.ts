import { ServerHello } from "../handshake/message/server/hello";
import { Certificate } from "../handshake/message/certificate";
import { KeyExchange } from "../handshake/message/keyExchange";
import { ServerHelloDone } from "../handshake/message/server/helloDone";
import { HandshakeType } from "../handshake/const";
import { ServerContext } from "../context/server";

export const flight5 = (server: ServerContext) => (
  messages: (ServerHello | Certificate | KeyExchange | ServerHelloDone)[]
) => {
  messages.forEach((message) => {
    handlers[message.msgType](server)(message);
  });
};

const handlers: {
  [key: number]: (server: ServerContext) => (message: any) => void;
} = {};

handlers[HandshakeType.server_hello] = (server: ServerContext) => (
  message: ServerHello
) => {
  server.version = message.serverVersion;
  server.random = message.random;
};
