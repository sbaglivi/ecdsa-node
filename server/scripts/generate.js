const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");


const privateKey = secp.secp256k1.utils.randomPrivateKey()
console.log('private key is:', toHex(privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);
const address = keccak256(publicKey.slice(1)).slice(-20);
console.log('address is:', toHex(address));

