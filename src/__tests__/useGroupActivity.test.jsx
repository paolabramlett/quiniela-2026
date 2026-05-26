// src/__tests__/useGroupActivity.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../utils/supabase', () => ({
  supabase: { rpc: vi.fn() },
}))

import { useGroupActivity } from '../hooks/useGroupActivity'
import { supabase } from '../utils/supabase'

const mockRpc = supabase.rpc

describe('useGroupActivity', () => {
  beforeEach(() => {
    mockRpc.mockReset()
  })

  it('starts in loading state', () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useGroupActivity('group-1'))
    expect(result.current.loading).toBe(true)
  })

  it('returns events on success', async () => {
    const events = [{ id: 'evt-1', event_type: 'joined', payload: {} }]
    mockRpc.mockResolvedValue({ data: events, error: null })
    const { result } = renderHook(() => useGroupActivity('group-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.events).toEqual(events)
  })

  it('sets error state on failure', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })
    const { result } = renderHook(() => useGroupActivity('group-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('RPC failed')
    expect(result.current.events).toEqual([])
  })

  it('calls get_group_activity with the correct groupId', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    renderHook(() => useGroupActivity('group-42'))
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('get_group_activity', { p_group_id: 'group-42' }))
  })
})
