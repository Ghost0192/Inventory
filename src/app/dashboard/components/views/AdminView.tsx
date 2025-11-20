"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Box, ClipboardCheck, Package } from "lucide-react" // íconos representativos

export default function AdminView() {
    const [totalUsuarios, setTotalUsuarios] = useState(0)
    const [totalProductos, setTotalProductos] = useState(0)
    const [stockTotal, setStockTotal] = useState(0)
    const [productosTop, setProductosTop] = useState<any[]>([])
    const [transacciones, setTransacciones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            // Total usuarios activos
            const { count: usuariosCount } = await supabase
                .from("a_usuarios")
                .select("*", { count: "exact", head: true })
                .eq("activo", true)

            // Total productos activos
            const { count: productosCount } = await supabase
                .from("a_productos")
                .select("*", { count: "exact", head: true })
                .eq("activo", true)

            // Últimas 20 transacciones
            const { data: transaccionesData } = await supabase
                .from("a_ingresos")
                .select("*")
                .order("fecha_ing", { ascending: false })
                .limit(20)

            // Top productos (ingresos - salidas)
            const { data: productosData } = await supabase.rpc("top_productos_stock") // mejor con función en la DB

            setTotalUsuarios(usuariosCount || 0)
            setTotalProductos(productosCount || 0)
            setStockTotal(productosData?.reduce((acc: number, p: any) => acc + p.stock_calculado, 0) || 0)
            setProductosTop(productosData || [])
            setTransacciones(transaccionesData || [])
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <p className="p-6">Cargando datos...</p>

    return (
        <div className="space-y-6 p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Ventory - Panel de Administración</h2>

            {/* MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-sm flex items-center space-x-4 p-4">
                    <Users className="w-10 h-10 text-blue-500" />
                    <CardContent>
                        <CardTitle>Total Usuarios</CardTitle>
                        <p className="text-2xl font-bold">{totalUsuarios}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm flex items-center space-x-4 p-4">
                    <Package className="w-10 h-10 text-green-500" />
                    <CardContent>
                        <CardTitle>Total Productos</CardTitle>
                        <p className="text-2xl font-bold">{totalProductos}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm flex items-center space-x-4 p-4">
                    <ClipboardCheck className="w-10 h-10 text-purple-500" />
                    <CardContent>
                        <CardTitle>Stock Total</CardTitle>
                        <p className="text-2xl font-bold">{stockTotal}</p>
                    </CardContent>
                </Card>
            </div>

            {/* TOP PRODUCTOS */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 productos más solicitados</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[350px] md:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productosTop}>
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="stock_calculado" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* TRANSACCIONES RECIENTES */}
            <Card>
                <CardHeader>
                    <CardTitle>Últimas 20 transacciones (Ingresos)</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tabla desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transacciones.map((t) => (
                                    <TableRow key={t.id_entr}>
                                        <TableCell>{t.nombre_prod}</TableCell>
                                        <TableCell>{t.cantidad_ingreso}</TableCell>
                                        <TableCell>{new Date(t.fecha_ing).toLocaleString()}</TableCell>
                                        <TableCell>{t.sucursal}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Cards móvil */}
                    <div className="sm:hidden space-y-3">
                        {transacciones.map((t) => (
                            <Card key={t.id_entr} className="shadow-sm border border-gray-200 flex items-center space-x-3 p-3">
                                <Package className="w-6 h-6 text-green-500" />
                                <CardContent className="p-0 space-y-1 text-sm">
                                    <p><strong>Producto:</strong> {t.nombre_prod}</p>
                                    <p><strong>Cantidad:</strong> {t.cantidad_ingreso}</p>
                                    <p><strong>Fecha:</strong> {new Date(t.fecha_ing).toLocaleString()}</p>
                                    <p><strong>Sucursal:</strong> {t.sucursal}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
