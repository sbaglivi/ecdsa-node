import Register from "./Register";
import Login from "./Login";
import { useState } from "react";

function AuthComponent({setAvailableAddresses}){
    const [isLogin, setIsLogin] = useState(false);
    return (
        <div className="biggerContainer">
        <div className="tabs">
            <button type="button" className={`tab tab-left ${isLogin ? 'active' : ""}`} onClick={setIsLogin.bind(null, true)}>Login</button>
            <button type="button" className={`tab ${isLogin ? "" : "active"}`} onClick={setIsLogin.bind(null, false)}>Register</button>
        </div>
        <div className="container no-border">
            <div>
                {isLogin ? <Login setAvailableAddresses={setAvailableAddresses}/> : <Register setAvailableAddresses={setAvailableAddresses}/>}
            </div>
        </div>
        </div>
    )
}

export default AuthComponent;