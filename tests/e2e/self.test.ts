import { DtlsServer, DtlsClient } from "../../src";

test("e2e/self", (done) => {
  const word = "self";
  const server = new DtlsServer({
    port: 55557,
    cert: `-----BEGIN CERTIFICATE-----
    MIICZjCCAc+gAwIBAgIULQTybAQgDKiAyVx421t2sAKw3IgwDQYJKoZIhvcNAQEL
    BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
    GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMDA1MTYwNzIxNDZaFw0yMDA2
    MTUwNzIxNDZaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
    HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwgZ8wDQYJKoZIhvcNAQEB
    BQADgY0AMIGJAoGBALRgNcGHEnKWB0RJ90ePKvVVR/cGV3+h7Pd+3V/Eq9ezFuGa
    iXkiwTsMvn5blk2wjnhN37YQY/Nk4RjVE6Zxgvpx5k7zIvXOjEYLdPcUwnY8gRz1
    /F8M/grOaRqdWluBPpxqJI1OYaSHP6y8aog3b+ZsEjmKCrS6TwokMDiC4m1JAgMB
    AAGjUzBRMB0GA1UdDgQWBBT38TPjqQbMphPmDEiej+XUCynyLjAfBgNVHSMEGDAW
    gBT38TPjqQbMphPmDEiej+XUCynyLjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
    DQEBCwUAA4GBAI+rG8T1s0ZeoKpirVMvpcJDlGKVJ2AgzQe3UfMFUPPfx76djgpo
    vwrjc2C5+xzqNbd8957nMkfOgplcsdLmFH9YmHzpbDCWCcG7JAV6ErI/kq2pIf7m
    6i1J876UNAk/J36t6ciHUjCpH0Wo/PVjV9Ke+QtMYt5LoNqWptv008bE
    -----END CERTIFICATE-----
    `,
    key: `-----BEGIN PRIVATE KEY-----
    MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBALRgNcGHEnKWB0RJ
    90ePKvVVR/cGV3+h7Pd+3V/Eq9ezFuGaiXkiwTsMvn5blk2wjnhN37YQY/Nk4RjV
    E6Zxgvpx5k7zIvXOjEYLdPcUwnY8gRz1/F8M/grOaRqdWluBPpxqJI1OYaSHP6y8
    aog3b+ZsEjmKCrS6TwokMDiC4m1JAgMBAAECgYAomf9/sIfWgy7fkEa5NODWmHu6
    fxLzB9/vVf8+r2Z/BzD/V2naephEUnoOt0797eAj9GOG9+mHwA1rKYtiy+pPVHfv
    1eqN+EvDNcBL8ZIX3Qta1H0bVCXwKQp6MVt0zRUjZUngv4Bp3RRNqakeLOeKq+9/
    lB2qGd05SO+U4kxwgQJBAOp/9bCEE0kasxKQptE1wWrUxmxyQjdlW24N194Jb6Dv
    WN7Jv9xP3RSU/lenWuk00g4VWKKY44EcxLi/ynByBdcCQQDE6eIuugcfX+HM9g3f
    El+X3VjC4HebRDPWLR0O59wt4ZS3jK0TFytystMUZtvY9c+5t0Ov9gNZRwpzD0mq
    koHfAkBJ9NNKuUzPyIDjgQVrg9WdWL+/ogVqLSg5vFnxZ+5xxiq0ENLWq8Vg4WCZ
    ymkslYEN+gN7PFa7+JO+ZJZ3Ai7/AkB2aLHzKTg5PJ36cwd6WYEUQC0s2m/x9Pw6
    0VwE55X2HQ0hpr04mpks2q2lOgj/mSj1Y2eXexcea2K0N8Aziu//AkAt6j2BfZ6U
    4NKYGWbCQoMl51dnQaSK89zzgSN1IBlg2E7rg/SXtaMTDSlH92u/fYjavgnjkWF0
    9A2XCrlJWawi
    -----END PRIVATE KEY-----
    `,
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
