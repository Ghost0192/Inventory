'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QrScannerModalProps {
    /** Control externo de apertura */
    open: boolean;
    /** Función para cerrar el modal */
    onClose: () => void;
    /** Callback al leer un código correctamente */
    onResult: (codigo: string) => void;
    /** Título opcional del modal */
    title?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
    open,
    onClose,
    onResult,
    title = 'Escanear código',
}) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const startScanner = async () => {
        const waitForElement = (id: string, timeout = 2000): Promise<HTMLElement> => {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const check = () => {
                    const el = document.getElementById(id);
                    if (el) resolve(el);
                    else if (Date.now() - start >= timeout) reject(new Error('Elemento no encontrado'));
                    else requestAnimationFrame(check);
                };
                check();
            });
        };

        try {
            const element = await waitForElement('reader');

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode('reader');
            }

            await scannerRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    onResult(decodedText);
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
                // ya detenido
            }
        }
    };

    useEffect(() => {
        if (open) startScanner();
        else stopScanner();

        return () => {
            stopScanner();
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full sm:max-w-[420px] h-[80vh] flex flex-col items-center">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div
                    id="reader"
                    className="w-full flex justify-center border rounded bg-black/5 min-h-[300px]"
                />

                <Button
                    type="button"
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={onClose}
                >
                    Cerrar
                </Button>
            </DialogContent>
        </Dialog>
    );
};
