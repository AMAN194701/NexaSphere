/**
 * A modal dialog component with focus trap.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Callback function when the modal is closed.
 * @param {React.ReactNode} props.children - Children elements to render within the modal.
 */
import React from 'react';
import useFocusTrap from '../hooks/useFocusTrap';

const Modal = ({ isOpen, onClose, children }) => {
  const { trapFocus, restoreFocus } = useFocusTrap();

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex="-1"
      onKeyDown={handleKeyDown}
      className="modal"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;