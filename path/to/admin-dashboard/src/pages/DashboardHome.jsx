import React from 'react';
import Modal from '../components/Modal';

const DashboardHome = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={handleOpenModal}>Open modal</button>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
          <div>Modal content</div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardHome;