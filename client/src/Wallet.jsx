import { useState } from "react";
import server from "./server";


function Wallet({availableAddresses}) {
  const [balance, setBalance] = useState("");
  const [address, setAddress] = useState("");

  async function getBalance() {
    try {
      const {data: {balance}} = await server.get(`balance/${address}`)
      // console.log(response)
      setBalance(balance)
    } catch (ex) {
      console.log(`while retrieving balance: ${ex}`)
    }
  }

  const onSelect = (f, e) => {
    f(e.target.value)
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <select className='select' onChange={onSelect.bind(null, setAddress)}>
          {availableAddresses.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </label>

      <button type="submit" className="button" onClick={getBalance}>Check balance</button>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
