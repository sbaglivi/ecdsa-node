function CopyEnabledText({text}){
    const copyToClipboard = v => {
        navigator.clipboard.writeText(v);
    }

    return (
        <div>
            <span className="copyEnabled">{text}</span>
            <button type='button' className='simpleButton' onClick={copyToClipboard.bind(null, text)}>Copy to clipboard</button>
        </div>
    )
}

export default CopyEnabledText;