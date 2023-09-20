import { useState, useEffect } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, hexToBytes, utf8ToBytes, bytesToUtf8} from "ethereum-cryptography/utils";
import Modal from "./Modal";
import RegistrationModal from "./RegistrationModal";
import server from "./server";
import {keccak256} from "ethereum-cryptography/keccak";
import {scrypt} from "ethereum-cryptography/scrypt";
import {encrypt, decrypt} from "ethereum-cryptography/aes";
import {getRandomBytes} from "ethereum-cryptography/random";

function addressFromPrivateKey(privateKey){
    let publicKey = secp.secp256k1.getPublicKey(privateKey);
    return toHex(keccak256(publicKey.slice(1)).slice(-20))
}

function Login({setAvailableAddresses}){
    const [privateKey, setPrivateKey] = useState("");
    const [password, setPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault()
        if (!password || !confirmationPassword) {
            setError("you need to fill both password and confirmation password")
            return
        }
        if (password !== confirmationPassword) {
            setError("password and confirmation password need to match")
            return
        }
        setError("")
        try {
            // let enc = utf8ToBytes(password.normalize("NFKC"))
            // const salt = await getRandomBytes(16)
            // var N = 1024, r = 8, p = 1;
            // let key = await scrypt(enc, salt, N, p, r, 16)
            // const iv = await getRandomBytes(16)
            // let ciphertext = await encrypt(hexToBytes(privateKey), key, iv)
            // let toBeSaved = toHex(ciphertext) + toHex(iv) + toHex(salt)
            // const address = addressFromPrivateKey(hexToBytes(privateKey))
            const address = 'lkasjdaldkfjasfdf'
            const {message} = await server.post('login', {address});
            console.log(message)
            localStorage.setItem(`eth-${address}`, toBeSaved);
            setAvailableAddresses(v => [...v, address])
        } catch (ex) {
            if (ex.response){ //if it's a 400 from server ex.response.data should contain what the server returned
                console.log('response', ex.response)
            } else if (ex.request) {
                console.log('request', ex.request)
            } else if (ex.message) {
                console.log('message', ex.message)
            }

            console.log(`while logging in: ${ex}`)
        }
    }
    return (
        <>
            <form className='transfer' onSubmit={handleSubmit}>
                <h1>Connect a wallet</h1>
                <p style={{fontSize: '14px'}}>This will save your credentials within your browser to be able to transfer funds from and to your account</p>
                <label>
                    Private Key
                    <input type="password" placeholder="Private Key" onChange={e => setPrivateKey(e.target.value)} value={privateKey}/>
                </label>
                <label>
                    Password
                    <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password}/>
                </label>
                <label>
                    Repeat your password
                    <input type="password" placeholder="Password" onChange={e => setConfirmationPassword(e.target.value)} value={confirmationPassword}/>
                </label>
                {error ? <p className="dangerText">{error}</p> : null}
                <button type="submit" className="button">Login</button>
            </form>
        </>
    )
}

export default Login;