import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const outputPath = resolve(__dirname, '../public/changelog.json')

try {
    const logOutput = execSync('git log -n 100 --pretty=format:"%H|~|%s|~|%cd|~|%an" --date=short').toString()

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

    const grouped = commits.reduce((acc, commit) => {
        if (!acc[commit.date]) acc[commit.date] = []
        acc[commit.date].push(commit)
        return acc
    }, {})

    const result = Object.entries(grouped).map(([date, items]) => ({ date, items }))

    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, JSON.stringify({ generated: new Date().toISOString(), data: result }, null, 2))

    console.log(`✅ Changelog generated with ${commits.length} commits → ${outputPath}`)
} catch (error) {
    console.error('❌ Failed to generate changelog:', error)
    process.exit(1)
}
