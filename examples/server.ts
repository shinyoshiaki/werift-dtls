import { DtlsServer } from "../src/server";
import { readFileSync } from "fs";

new DtlsServer({
  port: 6666,
  cert: readFileSync("assets/cert.pem").toString(),
  key: readFileSync("assets/key.pem").toString(),
});
