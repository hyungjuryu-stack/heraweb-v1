import React from 'react';
import Card from './ui/Card';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children, confirmButtonText = '삭제' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <Card title={title}>
          <div className="text-gray-300">
            {children}
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white font-medium">
              취소
            </button>
            <button 
              type="button" 
              onClick={onConfirm}
              className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-white font-bold">
              {confirmButtonText}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmationModal;
