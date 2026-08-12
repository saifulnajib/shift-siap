export const useShifts = () => {
  const apiGroups = useState<any[]>('shift-api-groups', () => [])
  const localGroups = useState<any[]>('shift-local-groups', () => [])
  const isLoading = useState<boolean>('shift-is-loading', () => false)
  const loadError = useState<string>('shift-load-error', () => '')

  const palette = ['#3b82f6', '#f97316', '#6366f1', '#14b8a6', '#ef4444', '#10b981', '#ec4899', '#8b5cf6']

  const getColor = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
    return palette[hash % palette.length]
  }

  const formatTime = (t: string) => (t || '').slice(0, 5)

  const mapGroup = (g: any) => ({
    id: String(g.id_group_jadwal),
    name: g.nama_group,
    start_time: formatTime(g.jadwal_masuk),
    end_time: formatTime(g.jadwal_pulang),
    keterangan: g.keterangan,
    is_shift: g.is_shift === '1',
    hari_kerja: g.hari_kerja,
    batas_masuk: g.batas_masuk,
    batas_pulang: g.batas_pulang,
    color: getColor(g.nama_group),
    ...g,
  })

  const groups = computed(() => {
    const merged = apiGroups.value.map(g => ({ ...g }))
    localGroups.value.forEach(lg => {
      const idx = merged.findIndex(g => g.id === lg.id)
      if (idx !== -1) merged[idx] = lg
      else merged.push(lg)
    })
    return merged
  })

  const fetchGroups = async () => {
    isLoading.value = true
    loadError.value = ''
    try {
      const res: any = await $fetch('/api/shifts/group-jadwal')
      apiGroups.value = (res.data || []).map(mapGroup)
    } catch (e: any) {
      loadError.value = e?.data?.message || e?.message || 'Gagal memuat data group jadwal'
      apiGroups.value = []
    } finally {
      isLoading.value = false
    }
  }

  const getGroupById = (id: string) => groups.value.find(g => String(g.id) === String(id))

  const saveGroup = (payload: any) => {
    if (payload.id) {
      const idx = localGroups.value.findIndex(g => g.id === payload.id)
      const base = groups.value.find(g => g.id === payload.id) || {}
      const next = { ...base, ...payload, color: payload.color || base.color }
      if (idx !== -1) localGroups.value[idx] = next
      else localGroups.value.push(next)
    } else {
      localGroups.value.push({ ...payload, id: `local-${Date.now()}` })
    }
  }

  return { groups, isLoading, loadError, fetchGroups, getGroupById, saveGroup }
}
