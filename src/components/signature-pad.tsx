'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

interface SignaturePadHandle {
  getDataURL: () => string
  isEmpty: () => boolean
}

const SignaturePad = forwardRef<SignaturePadHandle, { label?: string }>(function SignaturePad({ label }, ref) {
  const canvasRef = useRef<SignatureCanvas>(null)

  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
    isEmpty: () => canvasRef.current?.isEmpty() ?? true,
  }))

  return (
    <Box>
      {label && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <SignatureCanvas
          ref={canvasRef}
          penColor="#1f2937"
          canvasProps={{ style: { width: '100%', height: 120, touchAction: 'none', display: 'block' } }}
        />
      </Box>
      <Button
        type="button"
        size="small"
        onClick={() => canvasRef.current?.clear()}
        sx={{ mt: 0.5, fontSize: 11, color: 'text.secondary', p: 0.5 }}
      >
        Limpiar
      </Button>
    </Box>
  )
})

export default SignaturePad
