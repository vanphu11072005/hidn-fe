'use client';

import { X, AlertCircle, Coins } from 'lucide-react';
import { Button } from '@/components/common';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  required: number;
  available: number;
  toolName: string;
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  required,
  available,
  toolName,
}: InsufficientCreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center 
      justify-center p-4 bg-black bg-opacity-50 
      animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl max-w-md 
        w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 
              flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Không đủ credits
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {toolName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 
              transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn cần thêm credits để sử dụng công cụ này.
          </p>

          {/* Credit Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Credits cần thiết:
              </span>
              <span className="font-semibold text-primary">
                {required} credits
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Credits hiện có:
              </span>
              <span className="font-semibold text-red-600">
                {available} credits
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Thiếu:
                </span>
                <span className="font-bold text-red-600">
                  {required - available} credits
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Đóng
            </Button>
            <Button
              variant="primary"
              className="flex-1 flex items-center 
                justify-center space-x-2"
              onClick={() => {
                onClose();
                // TODO: Navigate to credits page
                window.location.href = '/credits';
              }}
            >
              <Coins className="w-4 h-4" />
              <span>Mua credits</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
