import { createClient } from '@/lib/supabase/server'
import ProductosClient from '@/components/productos-client'

export default async function ProductosPage() {
  const supabase = await createClient()
  const { data: productos } = await supabase.from('productos').select('*').order('nombre_comercial')
  return <ProductosClient initialProductos={productos ?? []} />
}
