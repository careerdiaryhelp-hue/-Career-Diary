export interface CAQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  solution: string;
}

/**
 * Robust parser that extracts MCQs / questions from:
 * 1. JavaScript arrays (e.g. const quizData = [ { q: "...", options: [...], ans: 1, expl: "..." }, ... ])
 * 2. HTML cards (e.g. class="q-card", "q-text", "opt-btn", "expl-box")
 * 3. HTML tables (e.g. Q1. with (A), (B), (C), (D) options)
 */
export function extractQuestionsFromContent(content: string): CAQuestion[] {
  if (!content || typeof content !== 'string') return [];

  // Strategy 1: Bracket-matching search for JavaScript array in content
  // Handles: const quizData = [ ... ]; var questions = [ ... ]; let mcqs = [ ... ];
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

            // Remove leading question numbers e.g. "1. ", "Q1. ", etc.
            const cleanQ = rawQ.replace(/^(?:Q\s*\d+|\d+)[\.\:\)\-\s]+/i, '').trim();

            let opts = { A: '', B: '', C: '', D: '' };
            if (Array.isArray(item.options)) {
              opts = {
                A: String(item.options[0] ?? '').replace(/^[A-Da-d][\.\:\)\-\s]+/, '').trim(),
                B: String(item.options[1] ?? '').replace(/^[A-Da-d][\.\:\)\-\s]+/, '').trim(),
                C: String(item.options[2] ?? '').replace(/^[A-Da-d][\.\:\)\-\s]+/, '').trim(),
                D: String(item.options[3] ?? '').replace(/^[A-Da-d][\.\:\)\-\s]+/, '').trim(),
              };
            } else if (item.options && typeof item.options === 'object') {
              opts = {
                A: String(item.options.A || item.options.a || item.options['1'] || '').trim(),
                B: String(item.options.B || item.options.b || item.options['2'] || '').trim(),
                C: String(item.options.C || item.options.c || item.options['3'] || '').trim(),
                D: String(item.options.D || item.options.d || item.options['4'] || '').trim(),
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

            const expl = String(item.expl || item.explanation || item.solution || item.desc || '').trim();

            questions.push({
              id: idx + 1,
              question: cleanQ || rawQ,
              options: opts,
              correct_answer: correct,
              solution: expl
            });
          });

          if (questions.length > 0) return questions;
        }
      }
    } catch (e) {
      console.warn('Error evaluating parsed array:', e);
    }
  }

  // Strategy 2: HTML Cards parsing (e.g. q-card, table rows)
  try {
    const questions: CAQuestion[] = [];
    const cardRegex = /<div[^>]*class=["'][^"']*q-card[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class=["'][^"']*q-card|$)/gi;
    let match;
    let idx = 1;

    while ((match = cardRegex.exec(content)) !== null) {
      const cardHtml = match[1];
      const qTextMatch = cardHtml.match(/<div[^>]*class=["'][^"']*q-text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      if (!qTextMatch) continue;

      const rawQ = qTextMatch[1].replace(/<[^>]*>/g, '').trim();
      const cleanQ = rawQ.replace(/^(?:Q\s*\d+|\d+)[\.\:\)\-\s]+/i, '').trim();

      const optMatches = [...cardHtml.matchAll(/<(?:button|li|div)[^>]*class=["'][^"']*(?:opt-btn|option)[^"']*["'][^>]*>([\s\S]*?)<\/(?:button|li|div)>/gi)];
      const opts = { A: '', B: '', C: '', D: '' };
      optMatches.slice(0, 4).forEach((om, optIdx) => {
        const text = om[1].replace(/<[^>]*>/g, '').replace(/^\([A-Da-d]\)\s*/, '').trim();
        const key = (['A', 'B', 'C', 'D'] as const)[optIdx];
        if (key) opts[key] = text;
      });

      const explMatch = cardHtml.match(/<div[^>]*class=["'][^"']*expl-box[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
      let expl = explMatch ? explMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      let correct: 'A' | 'B' | 'C' | 'D' = 'A';
      const ansMatch = expl.match(/(?:सही उत्तर|Correct Answer|Ans)[\s\:\-]+(?:\()?([A-D])(?:\))?/i);
      if (ansMatch) {
        correct = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
      }

      questions.push({
        id: idx++,
        question: cleanQ || rawQ,
        options: opts,
        correct_answer: correct,
        solution: expl
      });
    }

    if (questions.length > 0) return questions;
  } catch (_) {}

  return [];
}
