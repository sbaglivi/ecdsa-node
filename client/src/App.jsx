import Wallet from "./Wallet";
import Transfer from "./Transfer";
import AuthComponent from "./AuthComponent";
import "./App.scss";
import { useState, useEffect } from "react";

function App() {
  const [availableAddresses, setAvailableAddresses] = useState([]);

  useEffect(() => {
    let savedLogins = Object.keys(localStorage).filter(k => k.startsWith("eth-")).map(k => k.slice(4))
    setAvailableAddresses(savedLogins)
    if (savedLogins.length === 1) setAddress(savedLogins[0])
  }, [])

  return (
    <div className="app">
      <Wallet availableAddresses={availableAddresses} />
      <Transfer availableAddresses={availableAddresses} />
      <AuthComponent setAvailableAddresses={setAvailableAddresses}/>
    </div>
  );
}

export default App;
