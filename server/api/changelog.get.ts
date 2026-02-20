import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(() => {
    const filePath = resolve(process.cwd(), 'public/changelog.json')

    if (!existsSync(filePath)) {
        return {
            success: false,
            data: [{
                date: new Date().toISOString().split('T')[0],
                items: [{
                    hash: 'system',
                    subject: 'Changelog belum di-generate. Jalankan "npm run generate:changelog" sebelum build.',
                    author: 'System',
                    type: 'updated'
                }]
            }]
        }
    }

    try {
        const raw = readFileSync(filePath, 'utf-8')
        const json = JSON.parse(raw)
        return {
            success: true,
            data: json.data ?? []
        }
    } catch (error) {
        console.error('Failed to read changelog.json:', error)
        return {
            success: false,
            data: []
        }
    }
})
