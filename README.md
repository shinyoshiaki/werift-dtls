openssl genpkey -algorithm ED25519 > key.pem
vim 25519.cnf

```
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no
[req_distinguished_name]
C = DE
CN = www.example.com
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = www.example.com
DNS.2 = example.com
```

openssl req -new -out cert.csr -key key.pem -config 25519.cnf
openssl x509 -req -days 700 -in cert.csr -signkey key.pem -out cert.pem
