const fs = require('fs');
const files = [
  'src/app/last-date/page.js',
  'src/app/result/[slug]/page.js',
  'src/app/answerkey/[slug]/page.js',
  'src/app/answer-key/page.js',
  'src/app/privacy-policy/page.js',
  'src/app/top-online-forms/page.js',
  'src/app/latest-jobs/page.js',
  'src/app/terms/page.js',
  'src/app/admission/page.js',
  'src/app/admission/[slug]/page.js',
  'src/app/admitcard/[slug]/page.js',
  'src/app/important/[slug]/page.js',
  'src/app/syllabus/page.js',
  'src/app/syllabus/[slug]/page.js',
  'src/app/admit-card/page.js',
  'src/app/results/page.js',
  'src/app/job/[slug]/page.js',
  'src/app/contact-us/page.js',
  'src/app/[slug]/page.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('export const revalidate')) {
       // Insert after the last import statement
       const lines = content.split('\n');
       let lastImportLineIndex = -1;
       for (let i = 0; i < lines.length; i++) {
         if (lines[i].trim().startsWith('import ')) {
           lastImportLineIndex = i;
         }
       }
       if (lastImportLineIndex >= 0) {
         lines.splice(lastImportLineIndex + 1, 0, '\nexport const revalidate = 60;\n');
       } else {
         lines.unshift('export const revalidate = 60;\n');
       }
       fs.writeFileSync(file, lines.join('\n'));
       console.log('Added to ' + file);
    }
  }
}
