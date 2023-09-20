## ECDSA Node

This project is an example of using a client and server to facilitate transfers between different addresses. Since there is just a single server on the back-end handling transfers, this is clearly very centralized. We won't worry about distributed consensus for this project.

However, something that we would like to incoporate is Public Key Cryptography. By using Elliptic Curve Digital Signatures we can make it so the server only allows transfers that have been signed for by the person who owns the associated address.

### Video instructions
For an overview of this project as well as getting started instructions, check out the following video:

https://www.loom.com/share/0d3c74890b8e44a5918c4cacb3f646c4
 
### Client

The client folder contains a [react app](https://reactjs.org/) using [vite](https://vitejs.dev/). To get started, follow these steps:

1. Open up a terminal in the `/client` folder
2. Run `npm install` to install all the depedencies
3. Run `npm run dev` to start the application 
4. Now you should be able to visit the app at http://127.0.0.1:5173/

### Server

The server folder contains a node.js server using [express](https://expressjs.com/). To run the server, follow these steps:

1. Open a terminal within the `/server` folder 
2. Run `npm install` to install all the depedencies 
3. Run `node index` to start the server 

The application should connect to the default server port (3042) automatically! 

_Hint_ - Use [nodemon](https://www.npmjs.com/package/nodemon) instead of `node` to automatically restart the server on any changes.

### Changes
- Private key is never sent to backend any more. Now transfer messages are signed with the private key of the sender and, together with the recovery bit, this signature is what's used to derive the public key and from that the address from which to withdraw the funds.
- Backend now uses sqlite to have data persistence
- Added functionality to register new users, they just need to input a password and a private key gets generated for them. I also give them their wallet address which is the last 20 bytes of the keccak hash of their public key.
- When a new user is registered, its private key is saved in local storage after being encrypted. The encryption is done through AES CBC, the key is derived from the user password using scrypt. Both the salt used for creating the key and the IV for the encryption processes are stored alongside the priv. key in local storage.
- Wallet and Transfer now have a select to choose between saved addresses
- If you accidentally delete the data in your local storage but still have access to your private keys, you can re-add them through the login function. Your password does not need to match the previous one, your priv. key will get encrypted through this new password.

### Possible improvements
- Improve display of errors that happen during processes
- Logic is repeated throughout some components, could have extracted it to a different file
Didn't bother improving these parts since they seemed disconnected from cryptography which was what I was trying to learn.
- !! A good improvement would have been using a unique id for each transfer request, sequential, to be encrypted in the signed message. This way even if someone were to take hold of the body of a transfer request, he would not be able to use it to replicate the same transfer again. I might implement this in the future, the most annoying part is doing a double request from client to server: 1. getTransactionId(address) -> currentId 2. makeTransfer(transferBody (including currentId) + signature): boolean result
