import { DtlsClient } from "../src/client";

setTimeout(() => {
  const client = new DtlsClient({ address: "127.0.0.1", port: 4444 });
  client.onConnect = () => client.send(Buffer.from("hello"));
}, 100);
