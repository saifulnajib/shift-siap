import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

interface ChangelogEntry {
    type: 'added' | 'updated' | 'fixed' | 'removed' | 'deprecated'
    subject: string
}

interface ChangelogGroup {
    date: string
    items: ChangelogEntry[]
}

function parseChangelog(md: string): ChangelogGroup[] {
    const groups: ChangelogGroup[] = []
    let currentGroup: ChangelogGroup | null = null
    let currentType: string = 'updated'

    const typeMap: Record<string, string> = {
        'added': 'added',
        'updated': 'updated',
        'changed': 'updated',
        'fixed': 'fixed',
        'removed': 'removed',
        'deprecated': 'deprecated',
    }

    for (const line of md.split('\n')) {
        const trimmed = line.trim()

        // Match date heading: ## [2026-02-20]
        const dateMatch = trimmed.match(/^##\s+\[?(\d{4}-\d{2}-\d{2})\]?/)
        if (dateMatch) {
            if (currentGroup) groups.push(currentGroup)
            currentGroup = { date: dateMatch[1]!, items: [] }
            continue
        }

        // Match type heading: ### Added / ### Fixed etc
        const typeMatch = trimmed.match(/^###\s+(\w+)/)
        if (typeMatch) {
            const key = typeMatch[1]!.toLowerCase()
            currentType = typeMap[key] ?? 'updated'
            continue
        }

        // Match list items: - Some change description
        const itemMatch = trimmed.match(/^[-*]\s+(.+)/)
        if (itemMatch && currentGroup) {
            currentGroup.items.push({
                type: currentType as ChangelogEntry['type'],
                subject: itemMatch[1]!
            })
        }
    }

    if (currentGroup) groups.push(currentGroup)
    return groups
}

export default defineEventHandler(() => {
    const filePath = resolve(process.cwd(), 'CHANGELOG.md')

    if (!existsSync(filePath)) {
        return {
            success: false,
            data: [{
                date: new Date().toISOString().split('T')[0],
                items: [{
                    type: 'updated',
                    subject: 'CHANGELOG.md belum ditemukan di root project.'
                }]
            }]
        }
    }

    try {
        const raw = readFileSync(filePath, 'utf-8')
        const data = parseChangelog(raw)
        return { success: true, data }
    } catch (error) {
        console.error('Failed to parse CHANGELOG.md:', error)
        return { success: false, data: [] }
    }
})
