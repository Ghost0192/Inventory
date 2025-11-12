'use client';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

interface ScannerModalProps {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ open, onClose, onDetected }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-[400px] h-[80vh] sm:h-auto">
        <DialogHeader>
          <DialogTitle>Escanear código</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center w-full h-full">
          <QrReader
            delay={300}
            onError={(err) => console.error('Error de cámara:', err)}
            onScan={(data) => {
              if (data) {
                onDetected(data);
                onClose();
              }
            }}
            style={{ width: '100%', maxWidth: 400 }}
            constraints={{
              facingMode: 'environment', // Usa cámara trasera
            }}
          />

          <Button
            className="mt-3 bg-gray-500 hover:bg-gray-600 text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
