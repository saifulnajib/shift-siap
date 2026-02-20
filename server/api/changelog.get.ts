import { execSync } from 'child_process'

export default defineEventHandler(() => {
    try {
        // Format: hash|~|subject|~|date|~|author
        const logOutput = execSync('git log -n 50 --pretty=format:"%H|~|%s|~|%cd|~|%an" --date=short').toString()

        const commits = logOutput.split('\n').filter(line => line.trim()).map(line => {
            const parts = line.split('|~|')
            const subject = parts[1] || 'No commit message'
            const subjectLower = subject.toLowerCase()

            let type = 'updated'
            if (subjectLower.startsWith('add') || subjectLower.startsWith('feat')) type = 'added'
            else if (subjectLower.startsWith('update') || subjectLower.startsWith('chore') || subjectLower.startsWith('refactor')) type = 'updated'
            else if (subjectLower.startsWith('deprecate')) type = 'deprecated'
            else if (subjectLower.startsWith('remove') || subjectLower.startsWith('delete')) type = 'removed'
            else if (subjectLower.startsWith('fix')) type = 'fixed'

            return {
                hash: parts[0] || '',
                subject,
                date: parts[2] || '',
                author: parts[3] || 'Unknown',
                type
            }
        })

        // Group by date
        const grouped = commits.reduce((acc, commit) => {
            if (!acc[commit.date]) {
                acc[commit.date] = []
            }
            acc[commit.date]!.push(commit)
            return acc
        }, {} as Record<string, any[]>)

        const result = Object.entries(grouped).map(([date, items]) => ({
            date,
            items
        }))

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Failed to parse git log:', error)
        return {
            success: false,
            data: [{
                date: new Date().toISOString().split('T')[0],
                items: [{
                    hash: 'system',
                    subject: 'System initialized. Changelog (Git) not available in this environment.',
                    author: 'System',
                    type: 'update'
                }]
            }]
        }
    }
})
