function Modal({children, handleClose, show}){
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {children}
        <button type="button" className='closeButton simpleButton' onClick={handleClose}>
          Close
        </button>
      </section>
    </div>
  );
}

export default Modal;