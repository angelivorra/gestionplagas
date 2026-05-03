import { createClient } from '@/lib/supabase/server'
import VisitasList from '@/components/visitas-list'
import PageContainer from '@/components/page-container'
import type { Visita } from '@/lib/types'

export default async function VisitasPage() {
  const supabase = await createClient()
  const { data: visitas } = await supabase
    .from('visitas')
    .select('*, clientes(nombre_comercial)')
    .order('created_at', { ascending: false })

  return <PageContainer><VisitasList visitas={(visitas ?? []) as (Visita & { clientes?: { nombre_comercial: string } | null })[]} /></PageContainer>
}
