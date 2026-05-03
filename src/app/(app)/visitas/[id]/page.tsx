import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import VisitaForm from '@/components/visita-form'
import PageContainer from '@/components/page-container'

export default async function VisitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: visita, error } = await supabase
    .from('visitas')
    .select('*, clientes(*)')
    .eq('id', id)
    .single()

  if (error || !visita) notFound()

  return <PageContainer><VisitaForm visitaId={id} initialData={visita} /></PageContainer>
}
