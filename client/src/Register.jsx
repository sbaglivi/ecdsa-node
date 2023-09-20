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

function Register({setAvailableAddresses}){
    const handleSubmit = e => {
        e.preventDefault();
        if (password !== confirmationPassword){
            setError("The passwords do not match");
            return;
        }
        if (password.length === 0){
            setError("Password cannot be empty");
            return;
        }
        setError("");
        if (!credentials.privateKey || !credentials.address){
            const privateKeyBytes = secp.secp256k1.utils.randomPrivateKey();
            setCredentials({privateKey: toHex(privateKeyBytes), address: addressFromPrivateKey(privateKeyBytes)})
        } else {
            setCredentials({...credentials})
        }
    }

    function handleClose() {
        setModalShown(false);
        setCredentials({privateKey: "", address:""})
        setPassword("");
        setConfirmationPassword("");
    }

    const saveToStorage = () => {
        localStorage.setItem('eth-test', 'test value')
    }

    const [password, setPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");
    const [modalShown, setModalShown] = useState(false);
    const [credentials, setCredentials] = useState({privateKey: "", address: ""})
    const [error, setError] = useState("");

    useEffect(() => {
        if (!credentials.privateKey || !credentials.address) return;
        async function registerAndShowModal(){
            try {
                let enc = utf8ToBytes(password.normalize("NFKC"))
                const salt = await getRandomBytes(16)
                var N = 1024, r = 8, p = 1;
                let key = await scrypt(enc, salt, N, p, r, 16)
                const iv = await getRandomBytes(16)
                let ciphertext = await encrypt(hexToBytes(credentials.privateKey), key, iv)
                let toBeSaved = toHex(ciphertext) + toHex(iv) + toHex(salt)
                localStorage.setItem(`eth-${credentials.address}`, toBeSaved);
                const {message} = await server.post('register', {address: credentials.address});
                setAvailableAddresses(v => [...v, credentials.address])
                console.log(message)
                setModalShown(true)
            } catch (ex) {
                console.log(`exception while registering customer: ${ex}`);
            }
        }
        registerAndShowModal()
    }, [credentials])

    return (
        <>
            <Modal show={modalShown} handleClose={handleClose}>
                <RegistrationModal privateKey={credentials.privateKey} address={credentials.address}/>
            </Modal>
            <form className='transfer' onSubmit={handleSubmit}>
                <h1>Open an account</h1>
                <h3>25 plastic tokens gift if you sign up!</h3>
                <label>
                    Password
                    <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password}/>
                </label>
                <label>
                    Repeat your password
                    <input type="password" placeholder="Password" onChange={e => setConfirmationPassword(e.target.value)} value={confirmationPassword}/>
                </label>
                {error ? <p className="dangerText">{error}</p> : null}
                <button type="submit" className="button">Sign Up!</button>
            </form>
        </>
    )
}

export default Register;