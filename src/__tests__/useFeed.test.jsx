// src/__tests__/useFeed.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../utils/supabase', () => ({
  supabase: { rpc: vi.fn() },
}))
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

import { useFeed } from '../hooks/useFeed'
import { supabase } from '../utils/supabase'
import { useAuth } from '../hooks/useAuth'

const mockRpc = supabase.rpc

describe('useFeed', () => {
  beforeEach(() => {
    mockRpc.mockReset()
  })

  it('starts in loading state', () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useFeed())
    expect(result.current.loading).toBe(true)
  })

  it('returns events on success', async () => {
    const events = [{ id: 'evt-2', event_type: 'rank_up', payload: { old_rank: 3, new_rank: 1 } }]
    mockRpc.mockResolvedValue({ data: events, error: null })
    const { result } = renderHook(() => useFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual(events)
  })

  it('sets error state on failure', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Feed failed' } })
    const { result } = renderHook(() => useFeed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Feed failed')
    expect(result.current.events).toEqual([])
  })

  it('calls get_my_feed with the current user id', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    renderHook(() => useFeed())
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('get_my_feed', { p_user_id: 'user-1' }))
  })
})
