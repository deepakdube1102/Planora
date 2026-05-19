import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const usePosts = () => {
  const [posts, setPosts] = useState([])
  const [queueSlots, setQueueSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPosts([])
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchQueueSlots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setQueueSlots([])
        return []
      }

      const { data, error } = await supabase
        .from('queue_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('posting_time', { ascending: true })

      if (error) throw error
      setQueueSlots(data)
      return data
    } catch (err) {
      setError(err.message)
      return []
    }
  }

  const getNextAvailableSlot = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const slots = await fetchQueueSlots()
      if (!slots || !slots.length) return null

      const { data: existingPosts } = await supabase
        .from('posts')
        .select('scheduled_at')
        .eq('status', 'scheduled')
        .eq('user_id', user.id)
        .gte('scheduled_at', new Date().toISOString())

      let checkDate = new Date()
      for (let i = 0; i < 30; i++) {
         const currentDay = checkDate.getDay()
         const currentDateStr = checkDate.toISOString().split('T')[0]
         
         const daySlots = slots.filter(s => 
           s.day_of_week === currentDay || s.specific_date === currentDateStr
         )
         
         const sortedSlots = daySlots.sort((a, b) => a.posting_time.localeCompare(b.posting_time))

         for (const slot of sortedSlots) {
           const [hours, minutes] = slot.posting_time.split(':').map(Number)
           const potentialDate = new Date(checkDate)
           potentialDate.setHours(hours, minutes, 0, 0)
           
           if (potentialDate > new Date()) {
             const isTaken = existingPosts?.some(p => 
               Math.abs(new Date(p.scheduled_at).getTime() - potentialDate.getTime()) < 1000 * 60
             )
             if (!isTaken) return potentialDate
           }
         }
         checkDate.setDate(checkDate.getDate() + 1)
      }
      return null
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const addToQueue = async (postData) => {
    try {
      setLoading(true)
      const nextSlot = await getNextAvailableSlot()
      if (!nextSlot) throw new Error('No available slots found. Please check your schedule settings.')

      return await createPost({
        ...postData,
        scheduled_at: nextSlot.toISOString(),
        status: 'scheduled'
      })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const payload = {
        ...postData,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([payload])
        .select()

      if (error) throw error
      setPosts(prev => [...prev, ...data])
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updatePost = async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      setPosts(prev => prev.map(p => p.id === id ? data[0] : p))
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deletePost = async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && active) {
        await fetchPosts()
        await fetchQueueSlots()
      }
    }
    init()
    return () => { active = false }
  }, [])

  return { 
    posts, 
    queueSlots, 
    loading, 
    error, 
    createPost, 
    addToQueue, 
    getNextAvailableSlot,
    updatePost, 
    deletePost, 
    refresh: fetchPosts,
    fetchQueueSlots
  }
}
