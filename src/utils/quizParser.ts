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
  explanation_image?: string;
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

export function parseQuizJson(input: string | object, fileName: string = ''): ParsedQuizResult {
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
  let rawExam = raw.exam || raw.examName || 'BSSC CGL';
  if (rawExam.includes('प्रारंभिक') || rawExam.includes('परीक्षा')) {
    rawExam = rawExam.replace(/प्रारंभिक\s*परीक्षा/g, '').trim() || 'BSSC CGL-4';
  }

  let detectedSet = 'Set 1';
  const setMatch = (rawTitle + ' ' + (raw.set || '') + ' ' + baseName).match(/set[\s\-_]*(\d+)/i);
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
    let correct = String(q.correct_option || q.correctOption || q.correct_answer || q.answer || q.ans || 'A').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      // Find if correct was given as the actual answer text (e.g. "1963")
      const foundMatch = Object.entries(opts).find(([_, text]) => text && text.trim() === String(q.correct_answer || '').trim());
      if (foundMatch) {
        correct = foundMatch[0];
      } else {
        correct = String(q.correct_option || 'A').trim().toUpperCase();
      }
    }

    // 3. Normalize Images
    const isSet1 = fileName.toLowerCase().includes('set1') || fileName.toLowerCase().includes('set 1') || rawTitle.toLowerCase().includes('set 01') || rawTitle.toLowerCase().includes('set 1');
    let qImg = q.question_image || q.questionImage || q.image || q.img || '';
    if (typeof qImg === 'string' && qImg.trim()) {
      qImg = qImg.trim();
      if (qImg.startsWith('images/')) {
        qImg = `/quiz/bssc-cgl4-set1/${qImg}`;
      } else if (isSet1 && qImg.startsWith('data:image/')) {
        // Use static high-speed CDN image for set1 if available
        qImg = `/quiz/bssc-cgl4-set1/images/q${q.id}.jpg`;
      }
      questionsWithImage++;
    } else {
      qImg = '';
    }

    let expImg = q.explanation_image || q.explanationImage || q.solution_image || q.solutionImage || '';
    if (typeof expImg === 'string' && expImg.trim()) {
      expImg = expImg.trim();
      if (expImg.startsWith('images/')) {
        expImg = `/quiz/bssc-cgl4-set1/${expImg}`;
      } else if (isSet1 && expImg.startsWith('data:image/')) {
        // Use static high-speed CDN image for set1 if available
        expImg = `/quiz/bssc-cgl4-set1/images/s${q.id}.jpg`;
      }
      solutionsWithImage++;
    } else {
      expImg = '';
    }

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

    if (qImg) questionItem.image = qImg;
    if (expImg) questionItem.explanation_image = expImg;

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

  const imagesToCompress: { qIdx: number; field: 'image' | 'explanation_image'; url: string }[] = [];
  questions.forEach((q, qIdx) => {
    if (q.image && q.image.startsWith('data:image/') && q.image.length >= 35000) {
      imagesToCompress.push({ qIdx, field: 'image', url: q.image });
    }
    if (q.explanation_image && q.explanation_image.startsWith('data:image/') && q.explanation_image.length >= 35000) {
      imagesToCompress.push({ qIdx, field: 'explanation_image', url: q.explanation_image });
    }
  });

  if (imagesToCompress.length === 0) return questions;

  const updatedQuestions = questions.map(q => ({ ...q }));
  let done = 0;
  for (const item of imagesToCompress) {
    const comp = await compressOne(item.url);
    updatedQuestions[item.qIdx] = {
      ...updatedQuestions[item.qIdx],
      [item.field]: comp
    };
    done++;
    if (onProgress) onProgress(done, imagesToCompress.length);
  }

  return updatedQuestions;
}

