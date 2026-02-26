import XLSX from 'xlsx';
import { format, addDays, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

const workbook = XLSX.utils.book_new();

// Headers based on the template logic in index.vue:
// Periode: 21st of previous month to 20th of current month
// Row 4 (index 3) is where headers start if range: 3 is used.
// dataRows start after headerRow.

const today = new Date();
const yesterday = subDays(today, 1);
const tomorrow = addDays(today, 1);

const formatDate = (date) => format(date, 'd MMM', { locale: id });

const data = [
    [], // Row 1
    [], // Row 2
    [], // Row 3
    ['PIN', 'NIP', 'Nama', formatDate(yesterday), formatDate(today), formatDate(tomorrow)], // Row 4 (Headers)
    ['123', '19900101', 'Test User', 'Pagi', 'Malam', 'Sore'] // Row 5 (Data)
];

const worksheet = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

XLSX.writeFile(workbook, 'test-verification.xlsx');
console.log('Created test-verification.xlsx');
