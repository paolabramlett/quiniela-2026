import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const useGroups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchGroups()
  }, [user])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('groups')
        .select('*, group_members(count)')
        .order('created_at', { ascending: false })

      if (err) throw err
      setGroups(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = useCallback(async ({ name, maxMembers }) => {
    const invite_code = generateInviteCode()
    const { data: group, error: err } = await supabase
      .from('groups')
      .insert({ name, invite_code, created_by: user.id, max_members: maxMembers || null })
      .select()
      .single()

    if (err) throw err

    await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })
    await fetchGroups()
    return group
  }, [user])

  const joinGroup = useCallback(async (inviteCode) => {
    const { data: group, error: err } = await supabase
      .from('groups')
      .select('*, group_members(count)')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (err) throw new Error('Group not found')

    const memberCount = group.group_members[0]?.count ?? 0
    if (group.max_members && memberCount >= group.max_members) {
      throw new Error('Group is full')
    }

    const { error: joinErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id })

    if (joinErr && joinErr.code !== '23505') throw joinErr // ignore duplicate
    await fetchGroups()
  }, [user])

  const fetchGroupLeaderboard = async (groupId) => {
    const { data, error: err } = await supabase
      .from('leaderboard_group')
      .select('*')
      .eq('group_id', groupId)
      .order('rank', { ascending: true })

    if (err) throw err
    return data
  }

  return { groups, loading, error, createGroup, joinGroup, fetchGroupLeaderboard }
}
