import { useState, useEffect } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";
import {scrypt} from "ethereum-cryptography/scrypt";
import {decrypt} from "ethereum-cryptography/aes";

async function decipher(blob, password){
  try {
    const N = 1024, r = 8, p = 1;
    let ciphertext = blob.slice(0, 64)
    let iv = blob.slice(64, 96)
    let salt = blob.slice(96);
    let pwenc = utf8ToBytes(password.normalize("NFKC"))
    let key = await scrypt(pwenc, hexToBytes(salt), N, p, r, 16)
    return await decrypt(hexToBytes(ciphertext), key, hexToBytes(iv))
  } catch (ex) {
    console.log(`while decrypting private key: ${ex}`)
  }
}

function Transfer({availableAddresses}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const onSelect = (f, e) => {
    f(e.target.value)
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      let blob = localStorage.getItem(`eth-${address}`)
      if (!blob) {
        console.log('address not in memory')
        return
      }
      if (!password) {
        console.log("password cannot be empty")
        return
      }
      const privateKey = await decipher(blob, password);
      const message = {
        recipient,
        amount: parseInt(sendAmount)
      }
      const msgHash = keccak256(utf8ToBytes(JSON.stringify(message)))
      let signature = secp.secp256k1.sign(msgHash, privateKey)
      const signatureHex = signature.toCompactHex();
      const {
        data: { balance },
      } = await server.post(`send`, {
        signatureHex,
        message,
        recovery: signature.recovery
      });
      alert(`transfer successful, new balance: ${balance}`)
    } catch (ex) {
      console.log(`while transfering funds: ${ex}`)
    }
  }

  function updateAddress(e){
    setAddress(e.target.value)
    checkIfWalletInMemory()
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Funds</h1>
      <label>
        Sender
        <select className='select' onChange={onSelect.bind(null, setAddress)}>
          {availableAddresses.filter(a => a !== recipient).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </label>
      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Password
        <input type="password" placeholder="Type your password" value={password} onChange={setValue(setPassword)} />
      </label>

      <label>
        Recipient
        <select className='select' onChange={onSelect.bind(null, setRecipient)}>
          {availableAddresses.filter(a => a !== address).map(a => <option value={a}>{a}</option>)}
        </select>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
