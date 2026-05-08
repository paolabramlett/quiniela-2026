import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from './useAuth'

const MAX_GROUPS = 10

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
      // Fetch only groups the user belongs to
      const { data: memberships, error: mErr } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (mErr) throw mErr

      const groupIds = memberships.map(m => m.group_id)

      if (groupIds.length === 0) {
        setGroups([])
        return
      }

      const { data, error: err } = await supabase
        .from('groups')
        .select('*, group_members(count)')
        .in('id', groupIds)
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
    if (groups.length >= MAX_GROUPS) throw new Error(`Límite alcanzado: solo puedes pertenecer a ${MAX_GROUPS} grupos.`)

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
  }, [user, groups])

  const joinGroup = useCallback(async (inviteCode) => {
    if (groups.length >= MAX_GROUPS) throw new Error(`Límite alcanzado: solo puedes pertenecer a ${MAX_GROUPS} grupos.`)

    const { data: group, error: err } = await supabase
      .from('groups')
      .select('*, group_members(count)')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (err) throw new Error('Grupo no encontrado')

    const memberCount = group.group_members[0]?.count ?? 0
    if (group.max_members && memberCount >= group.max_members) {
      throw new Error('El grupo está lleno')
    }

    const { error: joinErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id })

    if (joinErr && joinErr.code !== '23505') throw joinErr
    await fetchGroups()
  }, [user, groups])

  const updateGroup = useCallback(async (groupId, { name }) => {
    const { error: err } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', groupId)

    if (err) throw err
    await fetchGroups()
  }, [user])

  const deleteGroup = useCallback(async (groupId) => {
    const { error: err } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)

    if (err) throw err
    await fetchGroups()
  }, [user])

  const leaveGroup = useCallback(async (groupId) => {
    const { error: err } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id)

    if (err) throw err
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

  // Fetches ALL group members merged with leaderboard scores
  const fetchGroupMembers = async (groupId) => {
    const [{ data: members, error: mErr }, { data: lb }] = await Promise.all([
      supabase.from('group_members').select('user_id').eq('group_id', groupId),
      supabase.from('leaderboard_group').select('*').eq('group_id', groupId),
    ])

    if (mErr) throw mErr

    const userIds = (members ?? []).map(m => m.user_id)
    if (userIds.length === 0) return []

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds)

    const lbMap = {}
    lb?.forEach(e => { lbMap[e.user_id] = e })

    const profileMap = {}
    profiles?.forEach(p => { profileMap[p.id] = p })

    return userIds
      .map(uid => {
        const profile = profileMap[uid] ?? {}
        const entry = lbMap[uid] ?? {}
        return {
          user_id: uid,
          display_name: profile.display_name ?? entry.display_name ?? 'Usuario',
          avatar_url: profile.avatar_url ?? entry.avatar_url ?? null,
          total_points: entry.total_points ?? 0,
          rank: entry.rank ?? null,
        }
      })
      .sort((a, b) => b.total_points - a.total_points || (a.display_name ?? '').localeCompare(b.display_name ?? ''))
  }

  const removeMember = useCallback(async (groupId, userId) => {
    const { error: err } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (err) throw err
  }, [])

  return { groups, loading, error, createGroup, joinGroup, updateGroup, deleteGroup, leaveGroup, fetchGroupLeaderboard, fetchGroupMembers, removeMember, maxGroups: MAX_GROUPS }
}
