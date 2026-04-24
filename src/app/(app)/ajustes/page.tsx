import { createClient } from '@/lib/supabase/server'
import AjustesClient from '@/components/ajustes-client'
import type { OpcionLista } from '@/lib/types'

const TABLAS = ['descripcion_servicio', 'tipo_servicio', 'lugar_actuacion']

export default async function AjustesPage() {
  const supabase = await createClient()
  const inicial: Record<string, OpcionLista[]> = {}

  await Promise.all(
    TABLAS.map(async tabla => {
      const { data } = await supabase
        .from('opciones_lista')
        .select('*')
        .eq('tabla', tabla)
        .order('orden')
        .order('valor')
      inicial[tabla] = data ?? []
    })
  )

  return <AjustesClient inicial={inicial} />
}
