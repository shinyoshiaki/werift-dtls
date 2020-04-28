/* Client                                          Server
   ------                                          ------

   ClientHello             -------->                           Flight 1

						   <-------    HelloVerifyRequest      Flight 2

   ClientHello             -------->                           Flight 3

											  ServerHello    \
											 Certificate*     \
									   ServerKeyExchange*      Flight 4
									  CertificateRequest*     /
						   <--------      ServerHelloDone    /

   Certificate*                                              \
   ClientKeyExchange                                          \
   CertificateVerify*                                          Flight 5
   [ChangeCipherSpec]                                         /
   Finished                -------->                         /

									   [ChangeCipherSpec]    \ Flight 6
						   <--------             Finished    /

			   Figure 1. Message Flights for Full Handshake

=======================================================================

   Client                                           Server
   ------                                           ------

   ClientHello             -------->                          Flight 1

											  ServerHello    \
									   [ChangeCipherSpec]     Flight 2
							<--------             Finished    /

   [ChangeCipherSpec]                                         \Flight 3
   Finished                 -------->                         /

		 Figure 2. Message Flights for Session-Resuming Handshake
						   (No Cookie Exchange)
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum HandshakeType {
  hello_request = 0,
  client_hello = 1,
  server_hello = 2,
  hello_verify_request = 3,
  certificate = 11,
  server_key_exchange = 12,
  certificate_request = 13,
  server_hello_done = 14,
  certificate_verify = 15,
  client_key_exchange = 16,
  finished = 20,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum ContentType {
  changeCipherSpec = 20,
  alert = 21,
  handshake = 22,
  applicationData = 23,
}
