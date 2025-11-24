"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

export default function AdminView() {
    const [totalUsuarios, setTotalUsuarios] = useState(0)
    const [ordenesEntrantes, setOrdenesEntrantes] = useState(0)
    const [ordenesCumplidas, setOrdenesCumplidas] = useState(0)
    type ProductoTop = { nombre: string; cantidad: number }
    const [productosTop, setProductosTop] = useState<ProductoTop[]>([])
    const [transacciones, setTransacciones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            const { count: usuariosCount } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })

            const { count: entrantesCount } = await supabase
                .from('Ordenes')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'pendiente')

            const { count: cumplidasCount } = await supabase
                .from('Ordenes')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'cumplida')

            const topDummy = [
                { nombre: 'Producto A', cantidad: 120 },
                { nombre: 'Producto B', cantidad: 95 },
                { nombre: 'Producto C', cantidad: 80 },
                { nombre: 'Producto D', cantidad: 75 },
                { nombre: 'Producto E', cantidad: 60 },
                { nombre: 'Producto F', cantidad: 55 },
                { nombre: 'Producto G', cantidad: 45 },
                { nombre: 'Producto H', cantidad: 40 },
                { nombre: 'Producto I', cantidad: 30 },
                { nombre: 'Producto J', cantidad: 25 },
            ]

            const { data: transaccionesData } = await supabase
                .from('Ingreso')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            setTotalUsuarios(usuariosCount || 0)
            setOrdenesEntrantes(entrantesCount || 0)
            setOrdenesCumplidas(cumplidasCount || 0)
            setProductosTop(topDummy)
            setTransacciones(transaccionesData || [])
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <p className="p-6">Cargando datos...</p>

    return (
        <div className="space-y-6 p-4">
            <h2 className="text-2xl font-bold mb-4">Ventory - Panel de Administración</h2>

            {/* MÉTRICAS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Total de Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalUsuarios}</p>
                        <p className="text-muted-foreground">Registrados en el sistema</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Total de Almacenes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalUsuarios}</p>
                        <p className="text-muted-foreground">Registrados en el sistema</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Órdenes Cumplidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{ordenesCumplidas}</p>
                        <p className="text-muted-foreground">Completadas exitosamente</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Órdenes Restantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{ordenesEntrantes - ordenesCumplidas}</p>
                        <p className="text-muted-foreground">Pendientes por completar</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Total de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{ordenesEntrantes}</p>
                        <p className="text-muted-foreground">Pendientes por procesar</p>
                    </CardContent>
                </Card>
            </div>

            {/* TOP PRODUCTOS */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 productos más solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productosTop}>
                                <XAxis dataKey="nombre" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* TRANSACCIONES RECIENTES */}
            <Card>
                <CardHeader>
                    <CardTitle>Últimas 20 transacciones (Ingresos a inventario)</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tabla en desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transacciones.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{t.Producto}</TableCell>
                                        <TableCell>{t.Cantidad}</TableCell>
                                        <TableCell>{t.Descripción}</TableCell>
                                        <TableCell>{t.Marca}</TableCell>
                                        <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Cards en móvil */}
                    <div className="sm:hidden space-y-3">
                        {transacciones.map((t) => (
                            <Card key={t.id} className="shadow-sm border border-gray-200">
                                <CardContent className="p-3 space-y-1 text-sm">
                                    <p><strong>Producto:</strong> {t.Producto}</p>
                                    <p><strong>Cantidad:</strong> {t.Cantidad}</p>
                                    <p><strong>Descripción:</strong> {t.Descripción}</p>
                                    <p><strong>Marca:</strong> {t.Marca}</p>
                                    <p><strong>Fecha:</strong> {new Date(t.created_at).toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
