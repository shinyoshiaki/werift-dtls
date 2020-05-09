import { spawn } from "child_process";
import { DtlsClient } from "../../src/client";

describe("e2e/client", () => {
  test(
    "openssl",
    (done) => {
      const args = [
        "s_server",
        "-cert",
        "./assets/cert.pem",
        "-key",
        "./assets/key.pem",
        "-dtls1_2",
        "-accept",
        "127.0.0.1:55555",
      ];

      const server = spawn("openssl", args);
      server.stdout.setEncoding("ascii");

      setTimeout(() => {
        const client = new DtlsClient({ address: "127.0.0.1", port: 55555 });
        client.onConnect = () => {
          client.send(Buffer.from("my_dtls"));
        };
        server.stdout.on("data", (data: string) => {
          if (data.includes("my_dtls")) {
            console.log(data);
            done();
            client.close();
          }
        });
      }, 100);
    },
    60 * 1000
  );
});
