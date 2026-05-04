'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

function LoginCard() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const msg = searchParams.get('msg')

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 360, p: 1 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar
            sx={{
              width: 64, height: 64, bgcolor: 'primary.main',
              borderRadius: 4, mx: 'auto', mb: 2,
              fontSize: 28, fontWeight: 700,
            }}
          >
            S
          </Avatar>
          <Typography variant="h5" gutterBottom>SACEBA</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: error ? 2 : 4 }}>
            Control de Plagas y Aguas
          </Typography>
          {error === 'unauthorized' && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              Acceso restringido. Usa la cuenta autorizada.
            </Alert>
          )}
          {error === 'auth' && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              Error al iniciar sesión. Inténtalo de nuevo.
              {msg && <Typography variant="caption" component="span" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>{msg}</Typography>}
            </Alert>
          )}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <GoogleIcon />
              )
            }
          >
            {loading ? 'Conectando...' : 'Entrar con Google'}
          </Button>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 3 }}>
            v1.0.0
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginCard />
    </Suspense>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
