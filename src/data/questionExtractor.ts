export interface CAQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    [key: string]: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D' | string;
  solution: string;
  image?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  topic?: string;
}

/**
 * Cleans HTML markup while preserving structure:
 * - Converts tables to text with dividers
 * - Converts <br>, <p>, <div>, <li>, <tr> to line breaks (\n)
 * - Decodes common HTML entities
 * - Removes remaining tags
 */
export function cleanHtmlText(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_all, tbl) => {
      return (
        '\n' +
        tbl
          .replace(/<\/tr>/gi, '\n')
          .replace(/<\/t[dh]>/gi, '  |  ')
          .replace(/<[^>]*>/g, '') +
        '\n'
      );
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;|&ndash;/g, '—')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Extracts the first image URL from an HTML snippet or tag
 */
export function extractImageFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return m ? m[1].trim() : '';
}

/**
 * Determines whether a line of text represents an MCQ option
 * (e.g. "(A) Option text" or "A. Option text")
 * while rejecting matching list lines like "A. गंधक — 1. मुंगेर"
 */
function isOptionLine(line: string): boolean {
  if (!line) return false;
  // If line contains a matching delimiter (e.g. "A. item — 1. target" or "A. item : target"), it's a matching list item
  if (/^[A-D]\.?[ \t]+[^\n—–\-:]+[—–\-:][ \t]*/i.test(line)) return false;
  return /^\(?([A-D])\)[\.\:\-\s]+/i.test(line) || /^[A-D][\.\:\)][ \t]+/i.test(line);
}

/**
 * Cleans option text by stripping option labels like (A), B., C), (क), etc.
 */
export function cleanOptionText(val: any): string {
  const s = String(val ?? '').trim();
  const optImg = extractImageFromHtml(s);
  if (optImg && !s.replace(/<img[^>]*>/gi, '').trim()) return optImg;
  return cleanHtmlText(s)
    .replace(/^\([A-Da-dक-घ]\)[\.\:\-]?\s*/, '')
    .replace(/^[A-Da-dक-घ][\)\.\:\-]+\s*/, '')
    .trim();
}

/**
 * Robust parser that extracts MCQs / questions from:
 * 1. JavaScript arrays (e.g. const quizData = [ { q: "...", image: "...", options: [...], ans: 1, expl: "..." }, ... ])
 * 2. HTML cards & boxes (e.g. class="question-box", "question-card", "q-card", "quiz-card", "mcq-card")
 *    Supports question images (<img>), matching lists (<br>, <table>), <ul class="options">, explanation boxes, etc.
 * 3. HTML tables / numbered question blocks (e.g. Q1. or प्र. 1) with (A), (B), (C), (D) options)
 */
export function extractQuestionsFromContent(content: string): CAQuestion[] {
  if (!content || typeof content !== 'string') return [];

  // ─────────────────────────────────────────────────────────────
  // Strategy 1: Bracket-matching search for JavaScript array
  // Handles: const quizData = [ ... ]; var questions = [ ... ]; let mcqs = [ ... ];
  // ─────────────────────────────────────────────────────────────
  const arrayStartMatch = content.match(/(?:quizData|questions|mcqs|testData|quizItems)\s*=\s*\[/i);
  let bracketStart = -1;
  if (arrayStartMatch && arrayStartMatch.index !== undefined) {
    bracketStart = content.indexOf('[', arrayStartMatch.index);
  } else {
    // Look for generic array of question objects: [{ q: or [{ question:
    const genericMatch = content.match(/\[\s*\{\s*["']?[qa]\w*["']?\s*:/i);
    if (genericMatch && genericMatch.index !== undefined) {
      bracketStart = genericMatch.index;
    }
  }

  if (bracketStart !== -1) {
    try {
      let depth = 0;
      let inString: string | null = null;
      let bracketEnd = -1;

      for (let i = bracketStart; i < content.length; i++) {
        const char = content[i];
        const prev = i > 0 ? content[i - 1] : '';

        if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
          if (!inString) inString = char;
          else if (inString === char) inString = null;
        } else if (!inString) {
          if (char === '[') depth++;
          else if (char === ']') {
            depth--;
            if (depth === 0) {
              bracketEnd = i;
              break;
            }
          }
        }
      }

      if (bracketEnd !== -1) {
        const arrayStr = content.slice(bracketStart, bracketEnd + 1);
        const parsed = new Function('return ' + arrayStr)();

        if (Array.isArray(parsed) && parsed.length > 0) {
          const questions: CAQuestion[] = [];
          parsed.forEach((item, idx) => {
            if (!item) return;
            const rawQ = String(item.q || item.question || item.title || '').trim();
            if (!rawQ) return;

            let img = String(item.image || item.img || item.imageUrl || item.pic || '').trim();
            if (!img) img = extractImageFromHtml(rawQ);

            // Clean question text and remove leading question numbers
            const cleanQ = cleanHtmlText(rawQ.replace(/<img[^>]*>/gi, ''))
              .replace(/^(?:प्र\.?\s*\d+|प्रश्न\s*\d+|Q\s*\d+|\d+)[\.\:\)\-\s]+/i, '')
              .trim();

            const cleanOpt = cleanOptionText;

            const rawOpts = item.options || item.opts || item.choices || item.answers;
            let opts = { A: '', B: '', C: '', D: '' };
            if (Array.isArray(rawOpts)) {
              opts = {
                A: cleanOpt(rawOpts[0]),
                B: cleanOpt(rawOpts[1]),
                C: cleanOpt(rawOpts[2]),
                D: cleanOpt(rawOpts[3]),
              };
            } else if (rawOpts && typeof rawOpts === 'object') {
              opts = {
                A: cleanOpt(rawOpts.A || rawOpts.a || rawOpts['1']),
                B: cleanOpt(rawOpts.B || rawOpts.b || rawOpts['2']),
                C: cleanOpt(rawOpts.C || rawOpts.c || rawOpts['3']),
                D: cleanOpt(rawOpts.D || rawOpts.d || rawOpts['4']),
              };
            }

            let correct: 'A' | 'B' | 'C' | 'D' = 'A';
            if (typeof item.ans === 'number') {
              const letter = (['A', 'B', 'C', 'D'] as const)[item.ans];
              if (letter) correct = letter;
            } else if (typeof item.ans === 'string') {
              const m = item.ans.match(/[A-D]/i);
              if (m) correct = m[0].toUpperCase() as 'A' | 'B' | 'C' | 'D';
            } else {
              const fallback = item.correct || item.correct_answer || item.answer || item.right || '';
              if (typeof fallback === 'number') {
                const letter = (['A', 'B', 'C', 'D'] as const)[fallback];
                if (letter) correct = letter;
              } else {
                const m = String(fallback).match(/[A-D]/i);
                if (m) correct = m[0].toUpperCase() as 'A' | 'B' | 'C' | 'D';
              }
            }

            let expl = cleanHtmlText(String(item.expl || item.exp || item.explanation || item.solution || item.desc || '').trim());
            if (!expl) {
              const optText = opts[correct] || '';
              expl = optText ? `सही उत्तर विकल्प (${correct}): ${optText} है।` : `सही उत्तर विकल्प (${correct}) है।`;
            }

            // Assign balanced difficulty if not explicitly set
            const mod = idx % 10;
            const autoDiff = (mod === 4 || mod === 9) ? 'Hard' : (mod % 2 === 0 ? 'Easy' : 'Medium');
            let diff = item.difficulty || item.diff || item.level;
            if (diff) {
              const dLower = String(diff).toLowerCase();
              if (dLower.includes('easy') || dLower.includes('सरल')) diff = 'Easy';
              else if (dLower.includes('hard') || dLower.includes('कठिन')) diff = 'Hard';
              else diff = 'Medium';
            } else {
              diff = autoDiff;
            }

            const qObj: CAQuestion = {
              id: idx + 1,
              question: cleanQ || rawQ,
              options: opts,
              correct_answer: correct,
              solution: expl,
              difficulty: diff,
              topic: item.topic || item.subject || 'General Studies'
            };
            if (img) qObj.image = img;
            questions.push(qObj);
          });

          if (questions.length > 0) return questions;
        }
      }
    } catch (e) {
      console.warn('Error evaluating parsed array:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Strategy 2: HTML Cards & Boxes
  // Supports: question-box, question-card, q-card, quiz-card, mcq-card, test-card, cbt-card
  // ─────────────────────────────────────────────────────────────
  try {
    const cardSplitRegex = /<div[^>]*class=["'][^"']*(?:question-box|question-card|q-card|quiz-card|mcq-card|test-card|cbt-card)[^"']*["'][^>]*>/i;
    if (cardSplitRegex.test(content)) {
      const cardParts = content.split(cardSplitRegex);
      const questions: CAQuestion[] = [];

      for (let i = 1; i < cardParts.length; i++) {
        const rawCard = cardParts[i];
        const cardContent = rawCard.split(/<\/body>|<script\b/i)[0];

        // 1. Question Title & Image
        const beforeOptions =
          cardContent.split(
            /<ul[^>]*class=["'][^"']*options|<label|<div[^>]*class=["'][^"']*(?:options|option-item|opt-btn)/i
          )[0] || cardContent;

        let qImage = extractImageFromHtml(beforeOptions);
        if (!qImage) qImage = extractImageFromHtml(cardContent);

        let questionRaw = '';
        const titleMatch =
          cardContent.match(
            /<div[^>]*class=["'][^"']*(?:question-title|question-box|question|q-text|quiz-title)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
          ) || cardContent.match(/<(?:h[2-6]|p|strong|b)[^>]*>([\s\S]*?)<\/(?:h[2-6]|p|strong|b)>/i);

        if (titleMatch) {
          questionRaw = titleMatch[1];
        } else {
          questionRaw = beforeOptions;
        }

        // Clean HTML, preserve newlines for matching lists (A. ... \n B. ...), remove <img> tags
        const cleanQuestion = cleanHtmlText(questionRaw.replace(/<img[^>]*>/gi, ''))
          .replace(/^(?:प्र\.?\s*\d+|प्रश्न\s*\d+|Q\s*\d+|\d+)[\.\:\)\-\s]+/i, '')
          .trim();

        // 2. Options A, B, C, D
        const options = { A: '', B: '', C: '', D: '' };

        // 2a. Options inside <ul class="options"><li>...</li></ul>
        const ulOptionsMatch = cardContent.match(/<ul[^>]*class=["'][^"']*options[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
        if (ulOptionsMatch) {
          const liMatches = [...ulOptionsMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
          const letters = ['A', 'B', 'C', 'D'] as const;
          liMatches.slice(0, 4).forEach((lm, idx) => {
            const rawLi = lm[1];
            const optImg = extractImageFromHtml(rawLi);
            let text = cleanHtmlText(rawLi.replace(/<img[^>]*>/gi, '')).replace(/^\s*[\(\[]?[A-D][\)\]\.\:\-]\s*/i, '').trim();
            if (optImg && !text) text = optImg;
            const key = letters[idx];
            if (key) options[key] = text;
          });
        }

        // 2b. Radio label format
        if (!options.A && !options.B) {
          const radioMatches = [
            ...cardContent.matchAll(
              /<label[^>]*>[\s\S]*?<input[^>]*value=["']([A-D])["'][^>]*>([\s\S]*?)<\/label>/gi
            ),
          ];
          if (radioMatches.length >= 2) {
            radioMatches.forEach(m => {
              const key = m[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
              const rawLab = m[2];
              const text = cleanOptionText(rawLab);
              options[key] = text;
            });
          }
        }

        // 2c. Elements with option-item / opt-btn
        if (!options.A && !options.B) {
          const liMatches = [
            ...cardContent.matchAll(
              /<(?:li|button|div)[^>]*class=["'][^"']*(?:option-item|opt-btn|option)[^"']*["'][^>]*>([\s\S]*?)<\/(?:li|button|div)>/gi
            ),
          ];
          const letters = ['A', 'B', 'C', 'D'] as const;
          liMatches.slice(0, 4).forEach((lm, idx) => {
            const rawLi = lm[1];
            const text = cleanOptionText(rawLi);
            const key = letters[idx];
            if (key) options[key] = text;
          });
        }

        // 2d. Fallback: Parse plain option lines inside card content
        if (!options.A && !options.B) {
          const lines = cleanHtmlText(cardContent).split('\n').map(l => l.trim()).filter(Boolean);
          lines.forEach(l => {
            const m = l.match(/^\(?\s*([A-D])\s*[\)\.\:\-]\s*(.+)/i);
            if (m && !l.includes('सही उत्तर') && !l.includes('Correct Answer') && !l.includes('उत्तर:')) {
              const k = m[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
              if (['A', 'B', 'C', 'D'].includes(k) && !options[k]) {
                options[k] = cleanOptionText(m[2]);
              }
            }
          });
        }

        // 3. Correct Answer
        let correct: 'A' | 'B' | 'C' | 'D' = 'A';
        const checkAnsMatch = cardContent.match(/checkAnswer\s*\(\s*['"][^'"]*['"]\s*,\s*['"]([A-D])['"]\s*\)/i);
        if (checkAnsMatch) {
          correct = checkAnsMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        } else {
          const ansMatch = cardContent.match(/(?:उत्तर|सही उत्तर|Correct Answer|Ans|Answer)[\s\:\-]+(?:\()?([A-D])(?:\))?/i);
          if (ansMatch) {
            correct = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
          }
        }

        // 4. Explanation
        let explanation = '';
        const expMatch =
          cardContent.match(/<p[^>]*class=["'][^"']*exp-text[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
          cardContent.match(
            /<div[^>]*class=["'][^"']*(?:explanation-box|expl-box|explanation|solution|answer-box|ans-box)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
          );
        if (expMatch) {
          explanation = cleanHtmlText(expMatch[1])
            .replace(/^(?:व्याख्या|स्पष्टीकरण|Explanation|Solution)[\s\:\(\)\-]*/i, '')
            .trim();
        } else {
          const inlineExpMatch = cardContent.match(/(?:व्याख्या|स्पष्टीकरण|Explanation|Solution)[\s\:\-]+([\s\S]*?)(?:<\/(?:div|p)>|<hr|$)/i);
          if (inlineExpMatch) {
            explanation = cleanHtmlText(inlineExpMatch[1]).trim();
          }
        }
        if (!explanation) {
          const optText = options[correct] || '';
          explanation = optText ? `सही उत्तर विकल्प (${correct}): ${optText} है।` : `सही उत्तर विकल्प (${correct}) है।`;
        }

        const mod = (i - 1) % 10;
        const autoDiff = (mod === 4 || mod === 9) ? 'Hard' : (mod % 2 === 0 ? 'Easy' : 'Medium');
        let cardDiff = '';
        const diffMatch = cardContent.match(/(?:difficulty|कठिनाई|level)[\s\:\-]+([A-Za-z]+)/i);
        if (diffMatch) {
          const dLower = diffMatch[1].toLowerCase();
          if (dLower.includes('easy')) cardDiff = 'Easy';
          else if (dLower.includes('hard')) cardDiff = 'Hard';
          else cardDiff = 'Medium';
        }

        if (cleanQuestion) {
          const qObj: CAQuestion = {
            id: i,
            question: cleanQuestion,
            options,
            correct_answer: correct,
            solution: explanation,
            difficulty: cardDiff || autoDiff,
            topic: 'General Studies'
          };
          if (qImage) qObj.image = qImage;
          questions.push(qObj);
        }
      }

      if (questions.length > 0) return questions;
    }
  } catch (e) {
    console.warn('Error in HTML cards parser:', e);
  }

  // ─────────────────────────────────────────────────────────────
  // Strategy 3: Generic numbered question regex (e.g. Q1. or प्र. 1)
  // ─────────────────────────────────────────────────────────────
  try {
    const qBlocks = content.split(/(?:<p>|<div[^>]*>|\n)\s*(?:<b>|<strong>)?\s*(?:प्र\.?\s*\d+|प्रश्न\s*\d+|Q\s*\d+|\d+)\s*[\.\:\)]/i);
    if (qBlocks.length > 1) {
      const questions: CAQuestion[] = [];
      for (let i = 1; i < qBlocks.length; i++) {
        const block = qBlocks[i];
        const qImage = extractImageFromHtml(block);
        const lines = cleanHtmlText(block.replace(/<img[^>]*>/gi, '')).split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 3) continue;

        // Find index where the first option begins
        let firstOptIdx = -1;
        for (let j = 0; j < lines.length; j++) {
          if (isOptionLine(lines[j])) {
            firstOptIdx = j;
            break;
          }
        }

        // Everything before first option is the question statement (including matching pairs)
        const qText = firstOptIdx > 0 ? lines.slice(0, firstOptIdx).join('\n') : lines[0];
        const searchLines = firstOptIdx >= 0 ? lines.slice(firstOptIdx) : lines.slice(1);

        const options = { A: '', B: '', C: '', D: '' };
        let correct: 'A' | 'B' | 'C' | 'D' = 'A';
        let explanation = '';

        searchLines.forEach(line => {
          const optMatch = line.match(/^\(?([A-D])\)[\.\:\-\s]+(.+)/i) || line.match(/^([A-D])[\.\:\-\s]+(.+)/i);
          if (optMatch) {
            const key = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
            options[key] = optMatch[2].trim();
          }
          const ansMatch = line.match(/(?:उत्तर|सही उत्तर|Ans|Answer|Correct Answer)[\s\:\-]+(?:\()?([A-D])(?:\))?/i);
          if (ansMatch) {
            correct = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
          }
          const expMatch = line.match(/(?:व्याख्या|स्पष्टीकरण|Exp|Explanation|Solution)[\s\:\-]+(.+)/i);
          if (expMatch) {
            explanation = expMatch[1].trim();
          }
        });

        if (options.A && options.B) {
          const mod = (i - 1) % 10;
          const autoDiff = (mod === 4 || mod === 9) ? 'Hard' : (mod % 2 === 0 ? 'Easy' : 'Medium');
          const qObj: CAQuestion = {
            id: i,
            question: qText,
            options,
            correct_answer: correct,
            solution: explanation,
            difficulty: autoDiff,
            topic: 'General Studies'
          };
          if (qImage) qObj.image = qImage;
          questions.push(qObj);
        }
      }
      if (questions.length > 0) return questions;
    }
  } catch (_) {}

  return [];
}
