import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClienteForm from '@/components/cliente-form'
import PageContainer from '@/components/page-container'

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return <PageContainer><ClienteForm cliente={data} /></PageContainer>
}
