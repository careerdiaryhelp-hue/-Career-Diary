import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'src/app');

function patchFile(filePath, filterFnStr) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the bad generateStaticParams
  content = content.replace(/export async function generateStaticParams\(\) \{[\s\S]*?\}\n/, '');

  // Add the imports
  if (!content.includes('getAllJobsServer')) {
    content = content.replace(/(import { getJobBySlug)/, '$1, getAllJobsServer');
  }
  
  if (!content.includes('categoryHelpers')) {
    const depth = filePath.split('/').length - appDir.split('/').length;
    const relativePrefix = '../'.repeat(depth - 1);
    content = `import { isResult, isAdmitCard, isAnswerKey, isAdmission, isSyllabus, isDocument, isImportant } from '${relativePrefix}data/categoryHelpers';\n` + content;
  }

  const exportConstMatch = content.match(/export const revalidate = \d+;/);
  if (!exportConstMatch) {
    console.log(`No revalidate export found in ${filePath}`);
    return;
  }

  const staticParamsCode = `
export async function generateStaticParams() {
  const jobs = await getAllJobsServer();
  return jobs.filter(${filterFnStr}).map((job) => ({
    slug: job.slug || job.id,
  }));
}
`;

  content = content.replace(exportConstMatch[0], `${staticParamsCode}\n${exportConstMatch[0]}`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched: ${filePath}`);
}

patchFile(path.join(appDir, '[slug]/page.js'), '() => true');
patchFile(path.join(appDir, 'job/[slug]/page.js'), '() => true');
patchFile(path.join(appDir, 'result/[slug]/page.js'), 'isResult');
patchFile(path.join(appDir, 'admitcard/[slug]/page.js'), 'isAdmitCard');
patchFile(path.join(appDir, 'answerkey/[slug]/page.js'), 'isAnswerKey');
patchFile(path.join(appDir, 'admission/[slug]/page.js'), 'isAdmission');
patchFile(path.join(appDir, 'syllabus/[slug]/page.js'), 'isSyllabus');
patchFile(path.join(appDir, 'important/[slug]/page.js'), '(j) => isDocument(j) || isImportant(j)');

console.log("Done patching.");
