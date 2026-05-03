import Box from '@mui/material/Box'

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return <Box sx={{ maxWidth: 600, mx: 'auto' }}>{children}</Box>
}
