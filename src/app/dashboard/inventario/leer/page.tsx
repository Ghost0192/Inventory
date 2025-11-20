'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrScannerModal } from '@/components/ui/common/QrScannerModal';

const LeerQR = () => {
    const [open, setOpen] = useState(false);
    const [codigo, setCodigo] = useState('');

    const handleResult = (data: string) => {
        console.log('Código leído:', data);
        setCodigo(data);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ejemplo de uso del lector QR</h2>

            <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setOpen(true)}
            >
                📷 Escanear código
            </Button>

            <input
                type="text"
                value={codigo}
                readOnly
                className="border p-2 w-full rounded"
                placeholder="Código leído"
            />

            <QrScannerModal
                open={open}
                onClose={() => setOpen(false)}
                onResult={handleResult}
                title="Escanea un producto"
            />
        </div>
    );
};

export default LeerQR;
