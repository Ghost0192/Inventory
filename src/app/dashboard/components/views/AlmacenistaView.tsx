//src/app/dashboard/components/views/AlmacenistaView.tsx
'use client';

import React from 'react';

export default function AlmacenistaView() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ventory - Almacen</h2>
            <ul className="list-disc pl-5">
                <li>Registrar y actualizar inventario</li>
                <li>Registrar movimientos de entrada/salida</li>
                <li>Crear nuevos productos</li>
                <li>Dar de alta solicitantes</li>
            </ul>
        </div>
    )
}
