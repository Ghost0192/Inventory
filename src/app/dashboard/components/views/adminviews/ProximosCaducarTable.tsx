"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductoProximoCaducar } from "../adminviews/types/types";

export default function ProximosCaducar() {
    const [rows, setRows] = useState<ProductoProximoCaducar[]>([]);

    useEffect(() => {
        supabase
            .rpc("productos_proximos_caducar")
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error cargando productos a caducar:", error);
                    return;
                }
                setRows(data || []);
            });
    }, []);

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Próximos a Caducar</h2>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Fecha Cad.</TableHead>
                        <TableHead>Días</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rows.map(item => (
                        <TableRow key={item.codigo_producto}>
                            <TableCell>{item.codigo_producto}</TableCell>
                            <TableCell>{item.nombre_prod}</TableCell>
                            <TableCell>{item.fecha_cad}</TableCell>
                            <TableCell>{item.dias_restantes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
