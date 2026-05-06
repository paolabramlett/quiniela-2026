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

  return { groups, loading, error, createGroup, joinGroup, updateGroup, deleteGroup, leaveGroup, fetchGroupLeaderboard, maxGroups: MAX_GROUPS }
}
