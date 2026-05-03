import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClienteDetalle from '@/components/cliente-detalle'
import PageContainer from '@/components/page-container'

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [clienteRes, visitasRes] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', id).single(),
    supabase.from('visitas').select('id, fecha_tratamiento, tipo_servicio, estado').eq('cliente_id', id).order('created_at', { ascending: false }),
  ])

  if (clienteRes.error || !clienteRes.data) notFound()

  return <PageContainer><ClienteDetalle cliente={clienteRes.data} visitas={visitasRes.data ?? []} /></PageContainer>
}
