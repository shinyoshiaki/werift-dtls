import { spawn } from "child_process";
import { DtlsClient } from "../src/client";

const args = [
  "s_server",
  "-cert",
  "./assets/cert.pem",
  "-key",
  "./assets/key.pem",
  "-dtls1_2",
  "-accept",
  "127.0.0.1:4444",
  "-state",
];

// const server = spawn("openssl", args);
// server.stdout.setEncoding("ascii");
// server.stdout.on("data", (data: string) => {
//   if (data.includes("### node->openssl")) {
//     server.stdin.write("### openssl->node\n");
//   }
// });

setTimeout(() => {
  new DtlsClient({ address: "127.0.0.1", port: 4444 });
}, 100);
