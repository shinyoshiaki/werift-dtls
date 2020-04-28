import { spawn } from "child_process";
import { flight1 } from "../src/flight/flight1";
import { createSocket } from "dgram";
import { DtlsPlaintext } from "../src/record/message/plaintext";

const server = spawn("openssl", [
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
]);
server.stdout.setEncoding("ascii");
server.stdout.on("data", (data: string) => {
  if (data.includes("### node->openssl")) {
    server.stdin.write("### openssl->node\n");
  }
});

setTimeout(() => {
  const socket = createSocket("udp4");
  socket.on("message", (msg) => {
    const c = DtlsPlaintext.deSerialize(msg);
    console.log(c);
  });
  flight1(socket, { address: "127.0.0.1", port: 5685 });
}, 100);
