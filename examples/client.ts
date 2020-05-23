import { DtlsClient } from "../src/client";
import { createSocket } from "dgram";

setTimeout(() => {
  const client = new DtlsClient({
    address: "127.0.0.1",
    port: 4444,
    socket: createSocket("udp4"),
  });
  client.onConnect = () => client.send(Buffer.from("hello"));
  client.connect();
}, 100);
