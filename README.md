server/client
```typescript
import { DtlsServer, DtlsClient } from "../../src";

test("e2e/self", (done) => {
  const word = "self";
  const server = new DtlsServer({ port: 55557 });
  server.onData = (data) => {
    expect(data.toString()).toBe(word);
    server.send(Buffer.from(word + "_server"));
  };
  const client = new DtlsClient({ address: "127.0.0.1", port: 55557 });
  client.onConnect = () => {
    client.send(Buffer.from(word));
  };
  client.onData = (data) => {
    expect(data.toString()).toBe(word + "_server");
    done();
  };
});

```

server/client(OpenSSL)
```typescript
import { spawn } from "child_process";
import { DtlsServer } from "../../src/server";

describe("e2e/server", () => {
  test("openssl", (done) => {
    const server = new DtlsServer({ port: 55556 });
    server.onConnect = () => {
      server.send(Buffer.from("my_dtls_server"));
    };

    setTimeout(() => {
      const client = spawn("openssl", [
        "s_client",
        "-dtls1_2",
        "-connect",
        "127.0.0.1:55556",
      ]);
      client.stdout.setEncoding("ascii");
      client.stdout.on("data", (data: string) => {
        if (data.includes("my_dtls_server")) {
          console.log(data);
          done();
          server.close();
        }
      });
    }, 100);
  });
});

```

client/server(OpenSSL)
```typescript
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

```
