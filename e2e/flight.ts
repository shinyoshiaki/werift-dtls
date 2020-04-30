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
  "127.0.0.1:5685",
  "-debug",
  "-msg",
];

const args2 = [
  "s_server",
  "-psk",
  "58394c53744f5065595433555a753577",
  "-dtls1_2",
  "-accept",
  "127.0.0.1:5685",
  "-debug",
  "-msg",
  "-state",
  "-cipher",
  "PSK-AES128-CCM8",
  "-nocert",
  "-no_ticket",
];

// const server = spawn("openssl", args);
// server.stdout.setEncoding("ascii");
// server.stdout.on("data", (data: string) => {
//   if (data.includes("### node->openssl")) {
//     server.stdin.write("### openssl->node\n");
//   }
// });

setTimeout(() => {
  const client = new DtlsClient({ address: "127.0.0.1", port: 4444 });
  console.log(client);
}, 100);
