<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'SHiFT Flow - Modern Shift Management',
  description: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  ogTitle: 'SHiFT Flow - Modern Shift Management',
  ogDescription: 'The all-in-one platform for seamless scheduling, workforce planning, and real-time team coordination.',
  twitterCard: 'summary_large_image',
})
const columns = [
  { key: 'name', label: 'Nama Shift', id: 'name' },
  { key: 'start_time', label: 'Jam Mulai', id: 'start_time' },
  { key: 'end_time', label: 'Jam Selesai', id: 'end_time' },
  { key: 'color', label: 'Warna', id: 'color' },
  { key: 'actions', label: 'Aksi', id: 'actions' }
]

const { data: shifts, refresh } = await useFetch('/api/shifts')

const isOpen = ref(false)
const state = reactive({
  id: undefined,
  name: '',
  start_time: '',
  end_time: '',
  color: '#3b82f6'
})

const resetState = () => {
    state.id = undefined
    state.name = ''
    state.start_time = ''
    state.end_time = ''
    state.color = '#3b82f6'
}

const openModal = (shift?: any) => {
  if (shift) {
    state.id = shift.id
    state.name = shift.name
    state.start_time = shift.start_time
    state.end_time = shift.end_time
    state.color = shift.color
  } else {
    resetState()
  }
  isOpen.value = true
}

const saveShift = async () => {
  try {
    if (state.id) {
       // Update logic (Not implemented yet in API, but frontend ready)
       // await $fetch(`/api/shifts/${state.id}`, { method: 'PUT', body: state })
       alert('Update feature coming soon')
    } else {
       await $fetch('/api/shifts', {
         method: 'POST',
         body: {
             name: state.name,
             start_time: state.start_time,
             end_time: state.end_time,
             color: state.color
         }
       })
    }
    await refresh()
    isOpen.value = false
  } catch (e: any) {
    alert(e.message)
  }
}

const deleteShift = async (id: number) => {
    if(!confirm('Are you sure?')) return
    await $fetch(`/api/shifts/${id}`, { method: 'DELETE' })
    await refresh()
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Master Shift</h2>
      <UButton icon="i-heroicons-plus" @click="openModal()">Tambah Shift</UButton>
    </div>

    <UTable :rows="shifts || []" :columns="columns">
        <template #color-data="{ row }">
            <div class="w-6 h-6 rounded-full" :style="{ backgroundColor: (row as any).color }"></div>
        </template>
        <template #actions-data="{ row }">
            <UButton icon="i-heroicons-pencil-square" variant="ghost" color="neutral" @click="openModal(row)" />
            <UButton icon="i-heroicons-trash" variant="ghost" color="error" @click="deleteShift((row as any).id)" />
        </template>
    </UTable>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <h3 class="font-bold">{{ state.id ? 'Edit Shift' : 'Tambah Shift' }}</h3>
        </template>

        <form @submit.prevent="saveShift" class="space-y-4">
            <UFormGroup label="Nama Shift">
                <UInput v-model="state.name" placeholder="Contoh: Pagi" required />
            </UFormGroup>
            
            <div class="grid grid-cols-2 gap-4">
                <UFormGroup label="Jam Mulai">
                    <UInput type="time" v-model="state.start_time" required />
                </UFormGroup>
                <UFormGroup label="Jam Selesai">
                    <UInput type="time" v-model="state.end_time" required />
                </UFormGroup>
            </div>

            <UFormGroup label="Warna Label">
                 <div class="flex gap-2">
                    <input type="color" v-model="state.color" class="h-10 w-10 p-0 border-0 rounded cursor-pointer" />
                    <UInput v-model="state.color" class="flex-1" />
                 </div>
            </UFormGroup>

            <div class="flex justify-end gap-2 mt-6">
                <UButton color="neutral" variant="ghost" @click="isOpen = false">Batal</UButton>
                <UButton type="submit" color="primary">Simpan</UButton>
            </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
