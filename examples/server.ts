import { DtlsServer } from "../src/server";

const server = new DtlsServer({ port: 6666 });
"openssl s_client -dtls1_2 -connect 127.0.0.1:6666 -state";
