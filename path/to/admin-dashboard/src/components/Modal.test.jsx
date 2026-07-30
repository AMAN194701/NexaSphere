import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Modal from './Modal';

describe('Modal component', () => {
  it('renders correctly when open', () => {
    const { getByRole } = render(
      <Modal isOpen={true} onClose={() => {}} children={<div>Modal content</div>} />
    );
    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when Escape key is pressed', () => {
    const onClose = jest.fn();
    const { getByRole } = render(
      <Modal isOpen={true} onClose={onClose} children={<div>Modal content</div>} />
    );
    fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('restores focus to previous element when closed', () => {
    const previousFocus = document.createElement('div');
    previousFocus.focus();
    const { getByRole } = render(
      <Modal isOpen={true} onClose={() => {}} children={<div>Modal content</div>} />
    );
    fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });
    expect(document.activeElement).toBe(previousFocus);
  });
});