import * as XLSX from 'xlsx'
import { subMonths, setDate, eachDayOfInterval, format } from 'date-fns'
import { id } from 'date-fns/locale'

export default defineEventHandler(async (event) => {
    // Auth check
    const query = getQuery(event)
    const username = query.username as string
    const password = query.password as string

    if (username !== 'adminrsud' || password !== 'punyakepegawaian123') {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Determine period: 21st of previous month to 20th of current month
    const now = new Date()
    const bulan = query.bulan ? parseInt(query.bulan as string) : now.getMonth() + 1
    const tahun = query.tahun ? parseInt(query.tahun as string) : now.getFullYear()

    const refDate = new Date(tahun, bulan - 1, 1)
    const periodStart = setDate(subMonths(refDate, 1), 21)
    const periodEnd = setDate(refDate, 20)
    const days = eachDayOfInterval({ start: periodStart, end: periodEnd })

    // Build header row
    const headerRow: string[] = ['PIN', 'NIP', 'Nama']
    for (const day of days) {
        headerRow.push(format(day, 'd MMM', { locale: id }))
    }

    // Example data rows (template - user fills in shift codes)
    const exampleRows = [
        ['123456', '199001012020011001', 'Contoh Pegawai 1', ...days.map(() => '')],
        ['789012', '199501012021012002', 'Contoh Pegawai 2', ...days.map(() => '')],
    ]

    // Build worksheet
    const wsData = [headerRow, ...exampleRows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Style header row (column widths)
    ws['!cols'] = [
        { wch: 12 },  // PIN
        { wch: 22 },  // NIP
        { wch: 30 },  // Nama
        ...days.map(() => ({ wch: 8 })),
    ]

    // Freeze first 3 columns
    ws['!freeze'] = { xSplit: 3, ySplit: 1 }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template Jadwal')

    // Add info sheet
    const infoData = [
        ['Panduan Pengisian Template Jadwal Shift'],
        [''],
        ['Periode:', `${format(periodStart, 'd MMM yyyy', { locale: id })} - ${format(periodEnd, 'd MMM yyyy', { locale: id })}`],
        [''],
        ['Kolom:', 'Keterangan'],
        ['PIN', 'Nomor PIN pegawai di sistem presensi'],
        ['NIP', 'Nomor Induk Pegawai'],
        ['Nama', 'Nama lengkap pegawai'],
        ['Tanggal (kolom selanjutnya)', 'Isi dengan kode shift (contoh: P = Pagi, S = Siang, M = Malam, L = Libur)'],
        [''],
        ['Catatan:', 'Hapus baris contoh sebelum mengisi data sesungguhnya'],
    ]
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData)
    wsInfo['!cols'] = [{ wch: 35 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Panduan')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const periodLabel = `${format(periodStart, 'ddMMyyyy')}-${format(periodEnd, 'ddMMyyyy')}`
    const filename = `template-jadwal-shift_${periodLabel}.xlsx`

    setResponseHeaders(event, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buf.length.toString(),
    })

    return buf
})
