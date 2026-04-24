import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductoDetalle from '@/components/producto-detalle'

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: producto } = await supabase.from('productos').select('*').eq('id', id).single()
  if (!producto) notFound()
  return <ProductoDetalle producto={producto} />
}
