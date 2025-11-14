"use client";

import React from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface Props {
    codigo: string;
    nombre: string;
}

export const QRButton: React.FC<Props> = ({ codigo, nombre }) => {

    const handlePrintQR = async () => {
        try {
            // 1️⃣ Generamos QR como imagen DataURL
            const qrDataUrl = await QRCode.toDataURL(codigo, {
                margin: 2,
                width: 300,
            });

            // 2️⃣ Nueva ventana para imprimir
            const printWindow = window.open("", "_blank");
            if (!printWindow) return;

            printWindow.document.write(`
                <html>
                <head>
                    <title>QR - ${codigo}</title>
                </head>
                <body style="font-family: Arial; display:flex; flex-direction:column; align-items:center; justify-content:center; padding-top:40px;">
                    
                    <img src="${qrDataUrl}" style="width:300px; margin-bottom:20px;" />

                    <div style="text-align:center; font-size:20px; font-weight:bold; margin-bottom:5px;">
                        ${codigo}
                    </div>

                    <div style="text-align:center; font-size:18px;">
                        ${nombre}
                    </div>

                    <script>
                        window.onload = () => { window.print(); };
                    </script>
                </body>
                </html>
            `);

            printWindow.document.close();

        } catch (error) {
            console.error("Error generando QR:", error);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handlePrintQR}
            className="flex items-center gap-2"
        >
            <Printer size={16} />
            QR
        </Button>
    );
};
