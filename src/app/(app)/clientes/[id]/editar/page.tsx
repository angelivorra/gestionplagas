import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClienteForm from '@/components/cliente-form'

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return <ClienteForm cliente={data} />
}
