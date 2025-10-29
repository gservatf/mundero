import { getAuth } from 'firebase/auth'
import { supabase } from '../supabase/supabaseClient'

let lastSyncTime = 0
let isSyncing = false
const SYNC_COOLDOWN_MS = 60000 // 1 minuto

/**
 * Sincroniza sesión Firebase ↔ Supabase con protección contra sobrecarga.
 */
export async function syncFirebaseWithSupabase() {
  if (isSyncing) return console.log('⏸️ Sync ya en curso.')
  const now = Date.now()
  if (now - lastSyncTime < SYNC_COOLDOWN_MS) return console.log('🕒 Cooldown activo.')

  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return console.warn('⚠️ No hay usuario autenticado en Firebase.')

  isSyncing = true
  try {
    const token = await user.getIdToken(true)
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'custom',
      token,
    })

    if (error) {
      if (error.message?.includes('rate limit')) {
        console.warn('⚠️ Rate limit alcanzado. Reintentando en 2 minutos...')
        setTimeout(syncFirebaseWithSupabase, 2 * 60 * 1000)
      } else {
        console.error('❌ Error de sincronización:', error)
      }
      return null
    }

    lastSyncTime = now
    console.log('✅ Sesión sincronizada correctamente con Supabase:', data.user?.id)
    return data
  } catch (err) {
    console.error('🔥 Error general en syncFirebaseWithSupabase:', err)
  } finally {
    isSyncing = false
  }
}