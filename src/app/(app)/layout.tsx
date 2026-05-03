import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/nav'
import Box from '@mui/material/Box'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Nav user={user} />
      <Box
        component="main"
        sx={{
          px: 2,
          pt: 2.5,
          pb: '96px',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
