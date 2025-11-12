'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Leer: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [resultado, setResultado] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const startScanner = async () => {
        // Espera a que el elemento esté en el DOM
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
                    setResultado(decodedText);
                    stopScanner();
                    setOpen(false);
                },
                (errorMessage) => {
                    // Ignorar errores menores
                }
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
                // No pasa nada si ya estaba detenido
            }
        }
    };

    // Control del modal
    useEffect(() => {
        if (open) startScanner();
        else stopScanner();

        return () => {
            stopScanner();
        };
    }, [open]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lector de códigos QR / Barras</h2>
            <p className="text-gray-600 text-sm">
                Escanea un código para registrar o buscar un producto.
            </p>

            <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setOpen(true)}
            >
                📷 Escanear Código
            </Button>

            <div>
                <label className="block font-medium mb-1">Código leído</label>
                <input
                    type="text"
                    value={resultado}
                    readOnly
                    className="border p-2 w-full rounded"
                    placeholder="Aún no se ha leído ningún código"
                />
            </div>

            {/* MODAL */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-full sm:max-w-[420px] h-[80vh] flex flex-col items-center">
                    <DialogHeader>
                        <DialogTitle>Escanear código</DialogTitle>
                    </DialogHeader>

                    {/* contenedor de la cámara */}
                    <div
                        id="reader"
                        className="w-full flex justify-center border rounded bg-black/5 min-h-[300px]"
                    />

                    <Button
                        type="button"
                        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
                        onClick={() => setOpen(false)}
                    >
                        Cerrar
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Leer;
