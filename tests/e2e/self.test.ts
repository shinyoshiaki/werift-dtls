import { DtlsServer, DtlsClient } from "../../src";
import { readFileSync } from "fs";

test("e2e/self", (done) => {
  const word = "self";
  const server = new DtlsServer({
    port: 55557,
    cert: readFileSync("assets/cert.pem").toString(),
    key: readFileSync("assets/key.pem").toString(),
  });
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
