import CopyEnabledText from "./CopyEnabledText";

function RegistrationModal({privateKey, address}){
    return (
        <>
            <h1>Welcome aboard!</h1>
            <p>your private key is:</p>
            <CopyEnabledText text={privateKey} />
            <p>This is the most important piece of information for your account. Write it down or store it in a secure location.</p>
            <p className='dangerText'>If you lose it, we will not be able to recover it and your funds will be unaccessible.</p>
            <br/>
            <p>your wallet address is:</p>
            <CopyEnabledText text={address} />
            <p>You will use this whenever someone needs to transfer funds to your account or you to theirs.</p>
        </>
    )
}

export default RegistrationModal;