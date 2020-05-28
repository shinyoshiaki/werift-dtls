import { Connection, Candidate } from "icet";
import { DtlsServer, DtlsClient, createIceTransport } from "../../src";
import { readFileSync } from "fs";

test("e2e/ice", async (done) => {
  const offer = new Connection(true, {
    stunServer: ["stun.l.google.com", 19302],
    log: false,
  });
  const answer = new Connection(false, {
    stunServer: ["stun.l.google.com", 19302],
    log: false,
  });
  await offer.gatherCandidates();
  answer.remoteCandidates = offer.localCandidates
    .map((v) => v.toSdp())
    .map((v) => Candidate.fromSdp(v));
  answer.remoteUsername = offer.localUserName;
  answer.remotePassword = offer.localPassword;
  await answer.gatherCandidates();
  offer.remoteCandidates = answer.localCandidates
    .map((v) => v.toSdp())
    .map((v) => Candidate.fromSdp(v));
  offer.remoteUsername = answer.localUserName;
  offer.remotePassword = answer.localPassword;

  await Promise.all([offer.connect(), answer.connect()]);

  const dtlsServer = new DtlsServer({
    socket: createIceTransport(offer),
    cert: readFileSync("assets/cert.pem").toString(),
    key: readFileSync("assets/key.pem").toString(),
  });
  dtlsServer.onConnect = () => {
    dtlsServer.send(Buffer.from("dtls_over_ice"));
  };
  const dtlsClient = new DtlsClient({ socket: createIceTransport(answer) });
  dtlsClient.onData = (buf) => {
    expect(buf.toString()).toBe("dtls_over_ice");
    done();
  };
  dtlsClient.connect();
});
