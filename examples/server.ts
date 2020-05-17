import { DtlsServer } from "../src/server";
import { readFileSync } from "fs";
import { createSocket } from "dgram";

new DtlsServer({
  port: 6666,
  cert: readFileSync("assets/cert.pem").toString(),
  key: readFileSync("assets/key.pem").toString(),
  socket: createSocket("udp4"),
});
