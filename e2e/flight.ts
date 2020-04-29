import { spawn } from "child_process";
import { flight1 } from "../src/flight/flight1";
import { flight3 } from "../src/flight/flight3";
import { createSocket } from "dgram";
import { UdpContext } from "../src/context/udp";
import { ClientContext } from "../src/context/client";
import { RecordContext } from "../src/context/record";

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

setTimeout(async () => {
  const socket = createSocket("udp4");
  const udp = new UdpContext(socket, { address: "127.0.0.1", port: 5685 });
  const flight = new ClientContext();
  const record = new RecordContext();

  udp.socket.on("message", (msg) => {
    console.log(msg);
  });

  const verifyReq = await flight1(udp, flight, record);
  flight3(udp, flight, record)(verifyReq);
}, 100);
