'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
    open: boolean;
    onClose: () => void;
    onScan: (codigo: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ open, onClose, onScan }) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const startScanner = async () => {
        const waitForElement = (id: string, timeout = 2000): Promise<HTMLElement> =>
            new Promise((resolve, reject) => {
                const start = Date.now();
                const check = () => {
                    const el = document.getElementById(id);
                    if (el) resolve(el);
                    else if (Date.now() - start >= timeout) reject(new Error('Elemento no encontrado'));
                    else requestAnimationFrame(check);
                };
                check();
            });

        try {
            const element = await waitForElement('qr-reader');
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode('qr-reader');
            }

            await scannerRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    onScan(decodedText);
                    stopScanner();
                    onClose();
                },
                () => { }
            );
        } catch (err) {
            console.error('Error al iniciar escáner:', err);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch {
                /* nada */
            }
        }
    };

    useEffect(() => {
        if (open) startScanner();
        else stopScanner();

        return () => stopScanner();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full sm:max-w-[420px] h-[80vh] flex flex-col items-center">
                <DialogHeader>
                    <DialogTitle>Escanear código</DialogTitle>
                </DialogHeader>
                <div id="qr-reader" className="w-full flex justify-center border rounded bg-black/5 min-h-[300px]" />
                <Button onClick={onClose} className="mt-4 bg-gray-500 hover:bg-gray-600 text-white">
                    Cerrar
                </Button>
            </DialogContent>
        </Dialog>
    );
};
