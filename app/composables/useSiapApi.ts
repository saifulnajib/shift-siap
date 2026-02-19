export const useSiapApi = () => {
    const fetchEmployees = async () => {
        return await $fetch('/api/employees')
    }

    const fetchEmployeesByUnitOpd = async (idUnitOpd: string) => {
        return await $fetch('/api/ref/pegawai', {
            method: 'POST',
            body: {
                id_unit_opd: idUnitOpd
            }
        })
    }

    const fetchDetailPresensi = async (params: { pin?: string; id_unit_opd?: string; bulan: number; tahun: number }) => {
        return await $fetch('/api/ref/detail-presensi', {
            method: 'POST',
            body: params
        })
    }

    const fetchAllPegawai = async (params: {
        id_opd: string
        id_unit_opd?: string
    }) => {
        return await $fetch('/api/ref/all-pegawai', {
            method: 'POST',
            body: params
        })
    }

    return {
        fetchEmployees,
        fetchEmployeesByUnitOpd,
        fetchDetailPresensi,
        fetchAllPegawai
    }
}
