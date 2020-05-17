import { DtlsServer } from "../src/server";
import { readFileSync } from "fs";
import { createSocket } from "dgram";

const port = 6666;
const socket = createSocket("udp4");
socket.bind(port);

new DtlsServer({
  port,
  cert: readFileSync("assets/cert.pem").toString(),
  key: readFileSync("assets/key.pem").toString(),
  socket,
});
