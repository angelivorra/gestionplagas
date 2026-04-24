'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PeopleIcon from '@mui/icons-material/People'
import ScienceIcon from '@mui/icons-material/Science'
import SettingsIcon from '@mui/icons-material/Settings'
import Divider from '@mui/material/Divider'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/visitas', label: 'Visitas', icon: <AssignmentIcon /> },
  { href: '/clientes', label: 'Clientes', icon: <PeopleIcon /> },
  { href: '/productos', label: 'Productos', icon: <ScienceIcon /> },
]

export default function Nav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'US'
  const avatar = user.user_metadata?.avatar_url as string | undefined

  const activeIndex = NAV_ITEMS.findIndex(item => pathname.startsWith(item.href))

  return (
    <>
      {/* Top App Bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ maxWidth: 600, width: '100%', mx: 'auto', px: { xs: 2 } }}>
          <Link href="/visitas" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexGrow: 1 }}>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 2, fontSize: 14, fontWeight: 700 }}
            >
              S
            </Avatar>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, fontSize: 18 }}>
              SACEBA
            </Typography>
          </Link>
          <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small">
            <Avatar
              src={avatar}
              sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 12, fontWeight: 700 }}
            >
              {initials}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 180, mt: 1 } } }}
          >
            <MenuItem disabled sx={{ fontSize: 12, color: 'text.secondary', opacity: '1 !important' }}>
              {user.email}
            </MenuItem>
            <Divider />
            <MenuItem component={Link} href="/ajustes" onClick={() => setAnchorEl(null)} sx={{ gap: 1.5 }}>
              <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 500 }}>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Bottom Navigation */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200,
          borderTop: '1px solid', borderColor: 'divider',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <BottomNavigation
          value={activeIndex === -1 ? false : activeIndex}
          sx={{ maxWidth: 600, mx: 'auto', bgcolor: 'background.paper' }}
        >
          {NAV_ITEMS.map((item, i) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={item.icon}
              component={Link}
              href={item.href}
              sx={{
                '&.Mui-selected .MuiBottomNavigationAction-label': { fontSize: 11 },
                '.MuiBottomNavigationAction-label': { fontSize: 11 },
                '& .MuiSvgIcon-root': {
                  color: activeIndex === i ? 'primary.main' : 'text.disabled',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  )
}
