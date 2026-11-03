export interface ParsedQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    [key: string]: string;
  };
  correct_answer: string;
  solution: string;
  image?: string;
  images?: string[];
  explanation_image?: string;
  explanation_images?: string[];
}

export interface ParsedQuizResult {
  title: string;
  exam: string;
  set: string;
  category: string;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  totalQuestions: number;
  description: string;
  slug: string;
  questions: ParsedQuestion[];
  topicsSummary: { [topic: string]: number };
  questionsWithImage: number;
  solutionsWithImage: number;
}

function cleanSlug(str: string): string {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getDefaultDifficulty(idx: number): 'Easy' | 'Medium' | 'Hard' {
  const mod = idx % 10;
  if (mod === 4 || mod === 9) return 'Hard';
  if (mod % 2 === 0) return 'Easy';
  return 'Medium';
}

function detectTopic(q: any, idx: number, totalQ: number): string {
  if (q.topic && typeof q.topic === 'string' && q.topic.trim()) {
    return q.topic.trim();
  }

  const sec = String((q.section_en || '') + ' ' + (q.section || '')).toLowerCase();
  if (sec.includes('math') || sec.includes('गणित') || sec.includes('संख्यात्मक') || sec.includes('arithmetic')) {
    return 'Mathematics';
  }
  if (sec.includes('reason') || sec.includes('तर्क') || sec.includes('mental') || sec.includes('logic')) {
    return 'Reasoning';
  }
  if (sec.includes('science') || sec.includes('विज्ञान')) {
    // If mixed GS & Science (standard 150 Q BSSC CGL set)
    const num = Number(q.id) || (idx + 1);
    if (num >= 49 && num <= 73) return 'General Science';
    if (num >= 1 && num <= 48) return 'General Studies';
    return 'General Science';
  }

  // Fallback based on standard 150 BSSC CGL / General Competitive Exam Question Index
  const num = Number(q.id) || (idx + 1);
  if (totalQ >= 140) {
    if (num >= 76 && num <= 100) return 'Mathematics';
    if (num >= 101 && num <= 150) return 'Reasoning';
    if (num >= 49 && num <= 73) return 'General Science';
    return 'General Studies';
  }

  return 'General Studies';
}

export function lookupImageInMap(
  imageMap: Record<string, string> | undefined,
  rawRef: string | null | undefined,
  questionId: string | number,
  type: 'q' | 's' = 'q'
): string | null {
  if (!imageMap || Object.keys(imageMap).length === 0) return null;

  const idStr = String(questionId).trim();
  const idNum = idStr.replace(/[^0-9]/g, '');

  // 1. Direct raw reference match (e.g. "images/q118.jpg", "q118.jpg", "images/q45_q.jpg")
  if (rawRef && typeof rawRef === 'string') {
    const cleanRef = rawRef.trim().toLowerCase().replace(/\\/g, '/');
    if (imageMap[cleanRef]) return imageMap[cleanRef];

    const baseName = cleanRef.split('/').pop() || cleanRef;
    if (imageMap[baseName]) return imageMap[baseName];

    const noExt = baseName.replace(/\.[^/.]+$/, '');
    if (imageMap[noExt]) return imageMap[noExt];
  }

  // 2. Lookup by Question ID and Prefix with broad naming pattern support
  const pad3 = idNum ? idNum.padStart(3, '0') : ''; // e.g. "010"
  const candidates = type === 'q'
    ? [
        `q${idStr}`, `q${idNum}`, `q${idNum}_q`, `q${idNum}-q`, `q${idNum}_question`, `q${idNum}_opts`,
        `question_${idStr}`, `question_${idNum}`, `question${idNum}`, `question_${idNum}_q`, `q_${idNum}`, `q_${idNum}_q`,
        `q${pad3}`, `q${pad3}_q`, `question_${pad3}`, `question_${pad3}_q`, idStr, idNum
      ]
    : [
        `q${idStr}_sol`, `q${idNum}_sol`, `q${idNum}-sol`, `q${idNum}_s`, `q${idNum}_ans`, `q${idNum}_explanation`, `q${idNum}_exp`,
        `q${pad3}_sol`, `q${pad3}-sol`, `q_${idNum}_sol`,
        `s${idStr}`, `s${idNum}`, `e${idStr}`, `e${idNum}`, `e${pad3}`, `s${pad3}`,
        `sol${idNum}`, `sol_${idNum}`, `solution_${idStr}`, `solution_${idNum}`, `solution${idNum}`,
        `exp${idNum}`, `exp_${idNum}`, `explanation_${idStr}`, `explanation_${idNum}`, `explanation${idNum}`
      ];

  for (const p of candidates) {
    if (!p) continue;
    const lowerP = p.toLowerCase();
    if (imageMap[lowerP]) return imageMap[lowerP];
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.svg']) {
      if (imageMap[`${lowerP}${ext}`]) return imageMap[`${lowerP}${ext}`];
      if (imageMap[`images/${lowerP}${ext}`]) return imageMap[`images/${lowerP}${ext}`];
    }
  }

  return null;
}

/**
 * Resolves one or multiple diagram images for a question or explanation from raw JSON references and memory map.
 */
export function resolveImages(
  rawRefs: any,
  questionId: string | number,
  type: 'q' | 's',
  imageMap?: Record<string, string>
): string[] {
  const refs: string[] = [];
  if (Array.isArray(rawRefs)) {
    rawRefs.forEach(r => {
      if (typeof r === 'string' && r.trim()) refs.push(r.trim());
    });
  } else if (typeof rawRefs === 'string' && rawRefs.trim()) {
    refs.push(rawRefs.trim());
  }

  const results: string[] = [];
  const seenUrls = new Set<string>();

  if (refs.length > 0) {
    for (const r of refs) {
      if (imageMap) {
        const matched = lookupImageInMap(imageMap, r, questionId, type);
        if (matched && !seenUrls.has(matched)) {
          results.push(matched);
          seenUrls.add(matched);
          continue;
        }
      }
      // If already a valid absolute path or data URL or remote URL, keep it
      if (
        (r.startsWith('data:') || r.startsWith('http://') || r.startsWith('https://') || r.startsWith('/')) &&
        !seenUrls.has(r)
      ) {
        results.push(r);
        seenUrls.add(r);
      }
    }
  }

  // Fallback: if no references matched from array/string, try matching by question ID in imageMap
  if (results.length === 0 && imageMap) {
    const matched = lookupImageInMap(imageMap, '', questionId, type);
    if (matched && !seenUrls.has(matched)) {
      results.push(matched);
      seenUrls.add(matched);
    }
  }

  return results;
}

export function parseQuizJson(
  input: string | object,
  fileName: string = '',
  imageMap?: Record<string, string>
): ParsedQuizResult {
  let raw: any = typeof input === 'string' ? JSON.parse(input) : input;
  let rawQuestions: any[] = [];

  if (Array.isArray(raw)) {
    rawQuestions = raw;
    raw = {};
  } else if (Array.isArray(raw.questions)) {
    rawQuestions = raw.questions;
  } else if (Array.isArray(raw.data)) {
    rawQuestions = raw.data;
  }

  const baseName = fileName.replace(/\.[^/.]+$/, '').trim();
  const rawTitle = raw.title || raw.name || baseName || 'BSSC CGL Full Mock Test';
  let rawExam = raw.exam || raw.examName || '';
  if (!rawExam) {
    const titleLower = (rawTitle + ' ' + baseName).toLowerCase();
    if (titleLower.includes('bihar daroga') || titleLower.includes('bihar si') || titleLower.includes('daroga')) {
      rawExam = 'Bihar Daroga (SI)';
    } else if (titleLower.includes('bssc')) {
      rawExam = 'BSSC CGL';
    } else if (titleLower.includes('bpsc')) {
      rawExam = 'BPSC';
    } else if (titleLower.includes('railway') || titleLower.includes('rrb')) {
      rawExam = 'Railway RRB';
    } else if (titleLower.includes('ssc gd')) {
      rawExam = 'SSC GD';
    } else if (titleLower.includes('up police')) {
      rawExam = 'UP Police';
    } else {
      rawExam = 'BSSC CGL';
    }
  }

  if (rawExam.includes('प्रारंभिक') || rawExam.includes('परीक्षा')) {
    rawExam = rawExam.replace(/प्रारंभिक\s*परीक्षा/g, '').trim() || 'BSSC CGL-4';
  }

  let detectedSet = 'Set 1';
  const setMatch = (rawTitle + ' ' + (raw.set || '') + ' ' + baseName).match(/(?:set|v\d+s|s)[\s\-_]*0*(\d+)/i);
  if (setMatch) {
    detectedSet = `Set ${parseInt(setMatch[1], 10)}`;
  } else if (raw.set) {
    detectedSet = String(raw.set);
  }

  const duration = Number(raw.duration_minutes || raw.durationMinutes || raw.duration) || 135;
  const marks = Number(raw.marking?.correct ?? raw.marksPerQuestion ?? raw.marks ?? 4) || 4;
  const neg = Math.abs(Number(raw.marking?.wrong ?? raw.negativeMarks ?? 1)) || 1;
  const totalQ = rawQuestions.length > 0 ? rawQuestions.length : (Number(raw.total_questions || raw.totalQuestions) || 150);

  const cleanExamSlug = cleanSlug(rawExam || 'bssc-cgl');
  const cleanSetSlug = cleanSlug(detectedSet).replace(/[^a-z0-9]/g, '') || 'set1';
  const slug = cleanSlug(raw.slug || raw.id || `${cleanExamSlug}-${cleanSetSlug}`);

  let questionsWithImage = 0;
  let solutionsWithImage = 0;

  const parsedQuestions: ParsedQuestion[] = rawQuestions.map((q: any, idx: number) => {
    // 1. Parse Options (supports array of [{label, text}] or object {A, B, C, D})
    const opts: { A: string; B: string; C: string; D: string; [key: string]: string } = {
      A: '',
      B: '',
      C: '',
      D: ''
    };

    if (Array.isArray(q.options)) {
      q.options.forEach((item: any, oIdx: number) => {
        if (typeof item === 'string') {
          const l = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
          opts[l] = item.trim();
        } else if (item && typeof item === 'object') {
          const l = String(item.label || item.key || item.opt || ['A', 'B', 'C', 'D'][oIdx] || 'A').trim().toUpperCase();
          opts[l] = String(item.text ?? item.value ?? item.option ?? '').trim();
        }
      });
    } else if (q.options && typeof q.options === 'object') {
      opts.A = String(q.options.A || q.options.a || q.options[0] || '').trim();
      opts.B = String(q.options.B || q.options.b || q.options[1] || '').trim();
      opts.C = String(q.options.C || q.options.c || q.options[2] || '').trim();
      opts.D = String(q.options.D || q.options.d || q.options[3] || '').trim();
    }

    // 2. Determine Correct Answer (Single uppercase letter A, B, C, D)
    let correct = String(q.correct || q.correct_option || q.correctOption || q.correct_answer || q.answer || q.ans || q.ans_key || 'A').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      // Find if correct was given as the actual answer text (e.g. "1963")
      const foundMatch = Object.entries(opts).find(([_, text]) => text && text.trim() === String(q.correct_answer || q.correct || '').trim());
      if (foundMatch) {
        correct = foundMatch[0];
      } else {
        correct = String(q.correct_option || q.correct || 'A').trim().toUpperCase();
      }
    }

    // 3. Normalize & Match Question and Explanation Images
    const rawQImgRef = q.question_images || q.images || q.q_images || q.question_image || q.questionImage || q.image || q.img;
    const matchedQImgs = resolveImages(rawQImgRef, q.id, 'q', imageMap);

    const rawSImgRef = q.explanation_images || q.solution_images || q.explanation_image || q.explanationImage || q.solution_image || q.solutionImage || q.sol_image;
    const matchedSImgs = resolveImages(rawSImgRef, q.id, 's', imageMap);

    if (matchedQImgs.length > 0) questionsWithImage++;
    if (matchedSImgs.length > 0) solutionsWithImage++;

    // 4. Solution / Detailed Explanation
    const rawSol = q.explanation || q.solution || q.detailed_solution || q.desc || '';
    const sol = rawSol && rawSol.trim()
      ? rawSol.trim()
      : (opts[correct]
        ? `इस प्रश्न का सही उत्तर विकल्प (${correct}): "${opts[correct]}" है।`
        : `इस प्रश्न का सही उत्तर विकल्प (${correct}) है।`);

    const topic = detectTopic(q, idx, totalQ);

    const questionItem: ParsedQuestion = {
      id: String(q.id || idx + 1),
      topic,
      subtopic: q.subtopic || q.section_en || q.section || '',
      difficulty: q.difficulty || getDefaultDifficulty(idx),
      question: String(q.question || q.title || q.text || '').trim(),
      options: opts,
      correct_answer: correct,
      solution: sol
    };

    if (matchedQImgs.length > 0) {
      questionItem.image = matchedQImgs[0];
      questionItem.images = matchedQImgs;
    }
    if (matchedSImgs.length > 0) {
      questionItem.explanation_image = matchedSImgs[0];
      questionItem.explanation_images = matchedSImgs;
    }

    return questionItem;
  });

  // Calculate Topics Summary
  const topicsSummary: { [topic: string]: number } = {};
  parsedQuestions.forEach(q => {
    topicsSummary[q.topic] = (topicsSummary[q.topic] || 0) + 1;
  });

  const description = raw.description || raw.subtitle || `${parsedQuestions.length} Questions • Full Syllabus • Negative Marking • Official Pattern & Detailed Solution`;

  return {
    title: rawTitle,
    exam: rawExam,
    set: detectedSet,
    category: raw.category || 'BIHAR GOVT EXAMS',
    durationMinutes: duration,
    marksPerQuestion: marks,
    negativeMarks: neg,
    totalQuestions: parsedQuestions.length,
    description,
    slug,
    questions: parsedQuestions,
    topicsSummary,
    questionsWithImage,
    solutionsWithImage
  };
}

/**
 * Optimizes/compresses base64 images in quiz questions to prevent Firestore size limits
 * and maximize mobile CBT test taking performance.
 */
export async function optimizeQuizQuestionsImages(
  questions: ParsedQuestion[],
  onProgress?: (done: number, total: number) => void
): Promise<ParsedQuestion[]> {
  if (typeof window === 'undefined' || !Array.isArray(questions) || questions.length === 0) {
    return questions;
  }

  const compressOne = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/') || dataUrl.length < 35000) {
        return resolve(dataUrl);
      }
      try {
        const img = new window.Image();
        img.onload = () => {
          const maxW = 750;
          let width = img.width;
          let height = img.height;
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      } catch (_) {
        resolve(dataUrl);
      }
    });
  };

  // Collect all images across image and explanation_image, including arrays
  const tasks: { qIdx: number; type: 'q' | 's'; imgIdx?: number; url: string }[] = [];
  questions.forEach((q, qIdx) => {
    if (Array.isArray(q.images) && q.images.length > 0) {
      q.images.forEach((url, i) => {
        if (url && url.startsWith('data:image/') && url.length >= 35000) {
          tasks.push({ qIdx, type: 'q', imgIdx: i, url });
        }
      });
    } else if (q.image && q.image.startsWith('data:image/') && q.image.length >= 35000) {
      tasks.push({ qIdx, type: 'q', url: q.image });
    }

    if (Array.isArray(q.explanation_images) && q.explanation_images.length > 0) {
      q.explanation_images.forEach((url, i) => {
        if (url && url.startsWith('data:image/') && url.length >= 35000) {
          tasks.push({ qIdx, type: 's', imgIdx: i, url });
        }
      });
    } else if (q.explanation_image && q.explanation_image.startsWith('data:image/') && q.explanation_image.length >= 35000) {
      tasks.push({ qIdx, type: 's', url: q.explanation_image });
    }
  });

  if (tasks.length === 0) return questions;

  const updatedQuestions = questions.map(q => ({
    ...q,
    images: Array.isArray(q.images) ? [...q.images] : (q.image ? [q.image] : undefined),
    explanation_images: Array.isArray(q.explanation_images) ? [...q.explanation_images] : (q.explanation_image ? [q.explanation_image] : undefined)
  }));

  let done = 0;
  for (const item of tasks) {
    const comp = await compressOne(item.url);
    const targetQ = updatedQuestions[item.qIdx];
    if (item.type === 'q') {
      if (typeof item.imgIdx === 'number' && targetQ.images) {
        targetQ.images[item.imgIdx] = comp;
        if (item.imgIdx === 0) targetQ.image = comp;
      } else {
        targetQ.image = comp;
        if (targetQ.images && targetQ.images.length > 0) targetQ.images[0] = comp;
      }
    } else {
      if (typeof item.imgIdx === 'number' && targetQ.explanation_images) {
        targetQ.explanation_images[item.imgIdx] = comp;
        if (item.imgIdx === 0) targetQ.explanation_image = comp;
      } else {
        targetQ.explanation_image = comp;
        if (targetQ.explanation_images && targetQ.explanation_images.length > 0) targetQ.explanation_images[0] = comp;
      }
    }
    done++;
    if (onProgress) onProgress(done, tasks.length);
  }

  return updatedQuestions;
}

/**
 * Extracts and parses a ZIP archive containing a quiz JSON file and an images/ folder of diagrams.
 * Automatically matches question and solution diagrams into optimized data URLs.
 */
export async function parseQuizZip(
  zipFile: File | Blob,
  onProgress?: (step: string, percent: number) => void
): Promise<ParsedQuizResult> {
  const JSZip = (await import('jszip')).default;
  if (onProgress) onProgress('Unpacking ZIP archive...', 15);

  const zip = await JSZip.loadAsync(zipFile);
  const fileKeys = Object.keys(zip.files);

  // 1. Locate JSON file in ZIP
  const jsonEntries = fileKeys.filter(
    k => !zip.files[k].dir && k.toLowerCase().endsWith('.json') && !k.startsWith('__MACOSX/')
  );

  if (jsonEntries.length === 0) {
    throw new Error('No .json file found inside the ZIP package. Please make sure the ZIP contains your questions JSON file.');
  }

  const targetJson = jsonEntries.find(k => /quiz|question|test|set/i.test(k)) || jsonEntries[0];
  if (onProgress) onProgress(`Reading ${targetJson}...`, 30);
  const jsonText = await zip.files[targetJson].async('text');

  // 2. Extract all images into memory map
  const imageEntries = fileKeys.filter(
    k => !zip.files[k].dir && /\.(png|jpe?g|webp|gif|svg)$/i.test(k) && !k.startsWith('__MACOSX/')
  );

  if (onProgress) onProgress(`Found ${imageEntries.length} diagrams. Extracting...`, 45);

  const imageMap: Record<string, string> = {};
  for (let i = 0; i < imageEntries.length; i++) {
    const entryName = imageEntries[i];
    const ext = entryName.split('.').pop()?.toLowerCase() || 'jpeg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
    const base64 = await zip.files[entryName].async('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const normKey = entryName.toLowerCase().replace(/\\/g, '/');
    const baseName = normKey.split('/').pop() || normKey;
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');

    imageMap[normKey] = dataUrl;
    imageMap[baseName] = dataUrl;
    imageMap[nameWithoutExt] = dataUrl;
  }

  // 3. Parse JSON with imageMap
  if (onProgress) onProgress('Matching diagrams to questions & options...', 70);
  const fileName = zipFile instanceof File ? zipFile.name : targetJson;
  const parsed = parseQuizJson(jsonText, fileName, imageMap);

  // 4. Optimize/compress images to prevent Firestore limits
  if (onProgress) onProgress('Optimizing diagrams for fast mobile CBT test...', 85);
  parsed.questions = await optimizeQuizQuestionsImages(parsed.questions);

  parsed.questionsWithImage = parsed.questions.filter(q => !!q.image || (Array.isArray(q.images) && q.images.length > 0)).length;
  parsed.solutionsWithImage = parsed.questions.filter(q => !!q.explanation_image || (Array.isArray(q.explanation_images) && q.explanation_images.length > 0)).length;

  if (onProgress) onProgress('Ready!', 100);
  return parsed;
}

/**
 * Attaches a standalone ZIP of images or a collection of image files to existing parsed questions.
 */
export async function attachImagesToQuestions(
  questions: ParsedQuestion[],
  zipOrFiles: File | Blob | File[] | FileList,
  onProgress?: (step: string, percent: number) => void
): Promise<{ updatedQuestions: ParsedQuestion[]; matchedQuestionImgs: number; matchedSolutionImgs: number }> {
  const imageMap: Record<string, string> = {};

  const isZip = (zipOrFiles instanceof File && zipOrFiles.name.toLowerCase().endsWith('.zip')) ||
    (zipOrFiles instanceof Blob && !(zipOrFiles instanceof File));

  if (isZip) {
    if (onProgress) onProgress('Unpacking images ZIP...', 20);
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipOrFiles as Blob);
    const imageEntries = Object.keys(zip.files).filter(
      k => !zip.files[k].dir && /\.(png|jpe?g|webp|gif|svg)$/i.test(k) && !k.startsWith('__MACOSX/')
    );
    for (const entryName of imageEntries) {
      const ext = entryName.split('.').pop()?.toLowerCase() || 'jpeg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
      const base64 = await zip.files[entryName].async('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const normKey = entryName.toLowerCase().replace(/\\/g, '/');
      const baseName = normKey.split('/').pop() || normKey;
      const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
      imageMap[normKey] = dataUrl;
      imageMap[baseName] = dataUrl;
      imageMap[nameWithoutExt] = dataUrl;
    }
  } else {
    // List of File objects
    if (onProgress) onProgress('Reading image files...', 20);
    const files = Array.from(zipOrFiles as Iterable<File>);
    for (const f of files) {
      if (!/\.(png|jpe?g|webp|gif|svg)$/i.test(f.name)) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ''));
        r.readAsDataURL(f);
      });
      const normKey = f.name.toLowerCase().replace(/\\/g, '/');
      const baseName = normKey.split('/').pop() || normKey;
      const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
      imageMap[normKey] = dataUrl;
      imageMap[baseName] = dataUrl;
      imageMap[nameWithoutExt] = dataUrl;
    }
  }

  if (onProgress) onProgress('Matching diagrams to questions...', 60);
  let matchedQ = 0;
  let matchedS = 0;

  const updated = questions.map(q => {
    const copy = { ...q };
    const rawQ = copy.images && copy.images.length > 0 ? copy.images : (copy.image ? [copy.image] : []);
    const foundQ = resolveImages(rawQ, copy.id, 'q', imageMap);
    if (foundQ.length > 0) {
      copy.image = foundQ[0];
      copy.images = foundQ;
      matchedQ++;
    }

    const rawS = copy.explanation_images && copy.explanation_images.length > 0 ? copy.explanation_images : (copy.explanation_image ? [copy.explanation_image] : []);
    const foundS = resolveImages(rawS, copy.id, 's', imageMap);
    if (foundS.length > 0) {
      copy.explanation_image = foundS[0];
      copy.explanation_images = foundS;
      matchedS++;
    }
    return copy;
  });

  if (onProgress) onProgress('Optimizing attached images...', 80);
  const optimized = await optimizeQuizQuestionsImages(updated);
  if (onProgress) onProgress('Done!', 100);

  return { updatedQuestions: optimized, matchedQuestionImgs: matchedQ, matchedSolutionImgs: matchedS };
}


