import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VisitaForm from '@/components/visita-form'

export default async function NuevaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>
}) {
  const { clienteId } = await searchParams
  const supabase = await createClient()

  const { data: visita, error } = await supabase
    .from('visitas')
    .insert({
      fecha_tratamiento: new Date().toISOString().split('T')[0],
      cliente_id: clienteId ?? null,
    })
    .select()
    .single()

  if (error || !visita) redirect('/visitas')

  return <VisitaForm visitaId={visita.id} initialData={visita} />
}
