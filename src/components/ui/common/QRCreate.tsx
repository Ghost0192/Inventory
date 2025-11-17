"use client";

import React from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface Props {
    codigo: string;
    nombre: string;
}

export const QRCreate: React.FC<Props> = ({ codigo, nombre }) => {
    const handlePrintQR = async () => {
        try {
            // Generamos el QR como DataURL
            const qrDataUrl = await QRCode.toDataURL(codigo, {
                margin: 2,
                width: 300,
            });

            // Abrimos una nueva ventana para imprimir
            const printWindow = window.open("", "_blank");
            if (!printWindow) return;

            printWindow.document.write(`
            <html>
            <head>
                <title>QR - ${codigo}</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding-top: 40px;
                }
                img {
                    width: 300px;
                    margin-bottom: 20px;
                }
                .codigo {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .nombre {
                    text-align: center;
                    font-size: 18px;
                }
                </style>
            </head>
            <body>
                <img src="${qrDataUrl}" />
                <div class="codigo">${codigo}</div>
                <div class="nombre">${nombre}</div>
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
