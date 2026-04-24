import { createClient } from '@/lib/supabase/server'
import ClientesList from '@/components/clientes-list'
import type { Cliente } from '@/lib/types'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre_comercial')

  return <ClientesList clientes={(clientes ?? []) as Cliente[]} />
}
