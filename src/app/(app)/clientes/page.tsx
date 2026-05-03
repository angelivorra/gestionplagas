import { createClient } from '@/lib/supabase/server'
import ClientesList from '@/components/clientes-list'
import PageContainer from '@/components/page-container'
import type { Cliente } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre_comercial')

  return <PageContainer><ClientesList clientes={(clientes ?? []) as Cliente[]} /></PageContainer>
}
