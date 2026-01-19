//src/app/dashboard/components/views/adminviews/TablaStockGeneral.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
// Supabase debería importarse desde lib/supabaseClient
// FIX: La ruta de importación se mantiene, pero se requiere un archivo mock en /lib para resolver el error de compilación.
import { supabase } from "@/lib/supabaseClient"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"; // Componente para el filtro

import { StockGeneral } from "../adminviews/types/types"; 
// FIX: La librería 'xlsx' es una dependencia externa que no está disponible en este entorno.
// Se comenta la importación para resolver el error de compilación.
import * as XLSX from "xlsx"; 
import clsx from "clsx";

export default function TablaStockGeneral() {
    const [items, setItems] = useState<StockGeneral[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    
    // NUEVO ESTADO: Filtro para la columna 'Estado'
    const [statusFilter, setStatusFilter] = useState<string>("all"); 

    // PAGINACIÓN
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // Función para mapear el estado a clases de Tailwind (diseño elegante y claro)
    const getRowColor = (estado: string) => {
        return clsx(
            "border-b border-gray-100", // Borde suave para separar filas
            {
                // URGENTE: Rojo. Fondo muy suave y borde izquierdo fuerte.
                "bg-red-50 hover:bg-red-100 transition-colors border-l-4 border-red-500": estado.includes("URGENTE"),
                // BAJO: Amarillo.
                "bg-yellow-50 hover:bg-yellow-100 transition-colors border-l-4 border-yellow-500": estado.includes("BAJO"),
                // SUFICIENTE: Blanco/Gris muy claro.
                "hover:bg-gray-50 transition-colors": estado.includes("SUFICIENTE"),
            }
        );
    };

    useEffect(() => {
        const loadStock = async () => {
            setLoading(true);
            
            try {
                // Usando el cliente Supabase
                const { data, error } = await supabase
                    .from("v_stock_disponible")
                    .select("*")
                    // Ordenamos por prioridad (1=URGENTE, 3=SUFICIENTE)
                    .order('orden_prioridad', { ascending: true }) 
                    .order('nombre_prod', { ascending: true }); 

                if (error) {
                    console.error("Error al cargar datos:", error);
                    setItems([]);
                } else {
                    setItems(data ?? []);
                }
            } catch (e) {
                console.error("Fallo la llamada a Supabase:", e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadStock();
    }, []);

    // BUSCADOR Y FILTRADO (Ahora incluye el filtro de estado)
    const filtered = useMemo(() => {
        // 1. Filtrar por texto
        let filteredItems = items.filter((item) => {
            const q = query.toLowerCase();
            const codigo = item.codigo_producto ? item.codigo_producto.toLowerCase() : '';
            const nombre = item.nombre_prod ? item.nombre_prod.toLowerCase() : '';
            
            return (
                codigo.includes(q) ||
                nombre.includes(q)
            );
        });

        // 2. Filtrar por Estado (si statusFilter no es "all")
        if (statusFilter !== "all") {
            // Filtramos por el string que incluye la palabra clave
            filteredItems = filteredItems.filter(item => item.estado_stock.includes(statusFilter));
        }
        
        // El reinicio de página se maneja en los handlers onChange.
        return filteredItems;
    }, [items, query, statusFilter]);
    
    // Función de cambio de filtro para resetear la paginación
    const handleStatusChange = (value: string) => {
        setPage(1); 
        setStatusFilter(value);
    };

    // PAGINACIÓN FINAL
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // EXPORTAR A EXCEL 
    const exportToExcel = () => {
        console.warn("La función de exportar a Excel requiere la librería 'xlsx'. Por favor, instálala en tu proyecto para que funcione. Se simulará la exportación en consola.");
        
        // Lógica real de exportación (se comenta el uso directo de XLSX para evitar error de compilación)
        const dataToExport = items.map(item => ({
            "Código Producto": item.codigo_producto,
            "Producto": item.nombre_prod,
            "Stock Mínimo": item.stock_min,
            "Total Ingresos": item.total_ingresos,
            "Total Salidas": item.total_salidas,
            "Stock Disponible": item.stock_disponible,
            "Estado de Stock": item.estado_stock.replace(/❌|⚠️|✔️/g, '').trim(), // Limpiamos el emoji
        }));
        
        if (typeof XLSX !== 'undefined' && XLSX.utils && XLSX.writeFile) {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Inventario");
            XLSX.writeFile(wb, "inventario_general.xlsx");
        } else {
            console.log("Datos listos para exportar:", dataToExport.slice(0, 5));
        }

        console.log("Datos listos para exportar (solo en consola):", dataToExport.slice(0, 5));
    };

    const statusOptions = [
        { value: "all", label: "Todos los estados" },
        { value: "URGENTE", label: "❌ URGENTE: SIN STOCK" },
        { value: "BAJO", label: "⚠️ STOCK BAJO: Reponer" },
        { value: "SUFICIENTE", label: "✔️ STOCK SUFICIENTE" },
    ];

    return (
        <div className="p-6 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-50">

            {/* HEADER Y BOTÓN */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h2 className="text-2xl font-extrabold text-gray-800 border-b-2">
                    Inventario de Productos ingresos vs salidas
                </h2>

                <Button 
                    onClick={exportToExcel} 
                    className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/60 transform hover:-translate-y-0.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Exportar Excel
                </Button>
            </div>

            {/* BUSCADOR Y FILTRO (Diseño mejorado) */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Buscar producto o código..."
                    value={query}
                    // Al cambiar el query, reiniciamos la paginación y actualizamos el query
                    onChange={(e) => {
                        setPage(1); 
                        setQuery(e.target.value);
                    }}
                    className="max-w-md bg-gray-50 border-gray-200 focus:border-indigo-500 transition-colors"
                />
                
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48 bg-gray-50 border-gray-200 focus:ring-indigo-500">
                        <SelectValue placeholder="Filtrar por estado..." />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHeader className="bg-gray-100 sticky top-0"> 
                        <TableRow className="text-gray-600 uppercase text-xs tracking-wider">
                            <TableHead className="w-28 font-semibold">Código</TableHead>
                            <TableHead className="font-semibold">Producto</TableHead>
                            <TableHead className="text-center font-semibold">Stock Mín.</TableHead>
                            <TableHead className="text-center font-semibold">Ingresos</TableHead>
                            <TableHead className="text-center font-semibold">Salidas</TableHead>
                            <TableHead className="text-center font-semibold">Disponible</TableHead>
                            <TableHead className="font-semibold">Estado</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-indigo-500">
                                    Cargando inventario...
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && paginated.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                                    No se encontraron resultados para los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading &&
                            paginated.map((item) => (
                                <TableRow key={item.codigo_producto} className={getRowColor(item.estado_stock)}>
                                    <TableCell className="font-mono text-sm text-gray-700">{item.codigo_producto}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{item.nombre_prod}</TableCell>
                                    <TableCell className="text-center text-blue-600">{item.stock_min}</TableCell>
                                    <TableCell className="text-center text-green-700 font-medium">{item.total_ingresos}</TableCell>
                                    <TableCell className="text-center text-red-700 font-medium">{item.total_salidas}</TableCell>
                                    <TableCell className="text-center font-extrabold text-xl text-indigo-600">{item.stock_disponible}</TableCell>
                                    <TableCell className="font-bold text-sm">
                                        <span className={clsx("p-1.5 rounded-full text-xs font-semibold uppercase tracking-wider", {
                                            "bg-red-200 text-red-800": item.estado_stock.includes("URGENTE"),
                                            "bg-yellow-200 text-yellow-800": item.estado_stock.includes("BAJO"),
                                            "bg-green-100 text-green-700": item.estado_stock.includes("SUFICIENTE"),
                                        })}>
                                            {/* Quitamos los emojis del texto visible para mantener la limpieza */}
                                            {item.estado_stock.replace(/❌|⚠️|✔️/g, '').trim()}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINACIÓN */}
            <div className="flex justify-between items-center pt-2 text-sm text-gray-600">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="hover:bg-indigo-50 border-gray-300 text-gray-700 transition-colors"
                >
                    Anterior
                </Button>

                <p>
                    Página <span className="font-semibold text-gray-800">{page}</span> de <span className="font-semibold text-gray-800">{totalPages}</span>
                </p>

                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="hover:bg-indigo-50 border-gray-300 text-gray-700 transition-colors"
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}