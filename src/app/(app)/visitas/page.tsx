import { createClient } from '@/lib/supabase/server'
import VisitasList from '@/components/visitas-list'
import type { Visita } from '@/lib/types'

export default async function VisitasPage() {
  const supabase = await createClient()
  const { data: visitas } = await supabase
    .from('visitas')
    .select('*, clientes(nombre_comercial)')
    .order('created_at', { ascending: false })

  return <VisitasList visitas={(visitas ?? []) as (Visita & { clientes?: { nombre_comercial: string } | null })[]} />
}
