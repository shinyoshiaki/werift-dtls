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
