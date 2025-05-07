import React from 'react';
import Button from '@components/Button';

import "./Styles/Modal.css";

const Modal = ({ message, onConfirm, onCancel, onConfirmBgColor, onCancelBgColor }) => {
  return (
    <div className="Modal--modal-overlay">
      <div className="modal">
        <p>{message}</p>
        <div style={{margin: "1rem auto -1rem", width: "fit-content"}}>
          <Button 
            backgroundColor={ onConfirmBgColor || "var(--primary-color)"} 
            size={"small"} 
            onClick={onConfirm}
          >
            Yes
          </Button>

          <Button 
            backgroundColor={onCancelBgColor || "#6b6b6b"}
            size={"small"}
            onClick={onCancel}
          >
            No
          </Button>

        </div>
      </div>
    </div>
  );
};

export default Modal;
