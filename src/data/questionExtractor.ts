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
 * 2. HTML cards (e.g. class="question-card", "q-card", "quiz-card", "mcq-card")
 *    Supports radio buttons with value="A", checkAnswer('q1', 'B'), explanation-box, etc.
 * 3. HTML tables / numbered question blocks (e.g. Q1. or प्र. 1) with (A), (B), (C), (D) options)
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

            // Remove leading question numbers e.g. "1. ", "Q1. ", "प्र. 1) ", etc.
            const cleanQ = rawQ.replace(/^(?:प्र\.?\s*\d+|प्रश्न\s*\d+|Q\s*\d+|\d+)[\.\:\)\-\s]+/i, '').trim();

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

  // Strategy 2: HTML Cards (supports class="question-card", "q-card", "quiz-card", "mcq-card")
  try {
    const cardSplitRegex = /<div[^>]*class=["'][^"']*(?:question-card|q-card|quiz-card|mcq-card)[^"']*["'][^>]*>/i;
    if (cardSplitRegex.test(content)) {
      const cardParts = content.split(cardSplitRegex);
      const questions: CAQuestion[] = [];

      for (let i = 1; i < cardParts.length; i++) {
        const rawCard = cardParts[i];
        const cardContent = rawCard.split(/<\/body>|<script\b/i)[0];

        // 1. Question Title
        let questionText = '';
        const titleMatch = cardContent.match(/<div[^>]*class=["'][^"']*(?:question-title|q-text|quiz-title)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
          || cardContent.match(/<(?:h[2-6]|p|strong|b)[^>]*>([\s\S]*?)<\/(?:h[2-6]|p|strong|b)>/i);

        if (titleMatch) {
          questionText = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        }

        const cleanQuestion = questionText.replace(/^(?:प्र\.?\s*\d+|प्रश्न\s*\d+|Q\s*\d+|\d+)[\.\:\)\-\s]+/i, '').trim();

        // 2. Options A, B, C, D
        const options = { A: '', B: '', C: '', D: '' };

        // Radio label format: <label class="option-label"><input ... value="A"> (A) Text</label>
        const radioMatches = [...cardContent.matchAll(/<label[^>]*class=["'][^"']*option-label[^"']*["'][^>]*>[\s\S]*?<input[^>]*value=["']([A-D])["'][^>]*>([\s\S]*?)<\/label>/gi)];
        if (radioMatches.length >= 2) {
          radioMatches.forEach(m => {
            const key = m[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
            const text = m[2].replace(/<[^>]*>/g, '').replace(/^\s*[\(\[]?[A-D][\)\]\.\:\-]\s*/i, '').trim();
            options[key] = text;
          });
        } else {
          // List / button / div option format: <li class="option-item">, <button class="opt-btn">
          const liMatches = [...cardContent.matchAll(/<(?:li|button|div)[^>]*class=["'][^"']*(?:option-item|opt-btn|option)[^"']*["'][^>]*>([\s\S]*?)<\/(?:li|button|div)>/gi)];
          const letters = ['A', 'B', 'C', 'D'] as const;
          liMatches.slice(0, 4).forEach((lm, idx) => {
            const text = lm[1].replace(/<[^>]*>/g, '').replace(/^\s*[\(\[]?[A-D][\)\]\.\:\-]\s*/i, '').trim();
            const key = letters[idx];
            if (key) options[key] = text;
          });
        }

        // 3. Correct Answer
        let correct: 'A' | 'B' | 'C' | 'D' = 'A';
        const checkAnsMatch = cardContent.match(/checkAnswer\s*\(\s*['"][^'"]*['"]\s*,\s*['"]([A-D])['"]\s*\)/i);
        if (checkAnsMatch) {
          correct = checkAnsMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        } else {
          const ansMatch = cardContent.match(/(?:सही उत्तर|Correct Answer|Ans|Answer)[\s\:\-]+(?:\()?([A-D])(?:\))?/i);
          if (ansMatch) {
            correct = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
          }
        }

        // 4. Explanation
        let explanation = '';
        const expMatch = cardContent.match(/<p[^>]*class=["'][^"']*exp-text[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)
          || cardContent.match(/<div[^>]*class=["'][^"']*(?:explanation-box|expl-box|explanation)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (expMatch) {
          explanation = expMatch[1].replace(/<[^>]*>/g, '').replace(/^(?:व्याख्या|Explanation)[\s\:\(\)]*/i, '').trim();
        }

        if (cleanQuestion || questionText) {
          questions.push({
            id: i,
            question: cleanQuestion || questionText,
            options,
            correct_answer: correct,
            solution: explanation
          });
        }
      }

      if (questions.length > 0) return questions;
    }
  } catch (e) {
    console.warn('Error in HTML cards parser:', e);
  }

  // Strategy 3: Generic numbered question regex (e.g., Q1. or प्र. 1) with (A), (B), (C), (D) options)
  try {
    const qBlocks = content.split(/(?:<p>|<div[^>]*>|\n)\s*(?:<b>|<strong>)?\s*(?:प्र\.?\s*\d+|प्रश्न\s*\d+|Q\s*\d+|\d+)\s*[\.\:\)]/i);
    if (qBlocks.length > 1) {
      const questions: CAQuestion[] = [];
      for (let i = 1; i < qBlocks.length; i++) {
        const block = qBlocks[i];
        const lines = block.replace(/<[^>]*>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 3) continue;

        const qText = lines[0];
        const options = { A: '', B: '', C: '', D: '' };
        let correct: 'A' | 'B' | 'C' | 'D' = 'A';
        let explanation = '';

        lines.forEach(line => {
          const optMatch = line.match(/^\(?([A-D])\)[\.\:\-\s]+(.+)/i);
          if (optMatch) {
            const key = optMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
            options[key] = optMatch[2].trim();
          }
          const ansMatch = line.match(/(?:Ans|Answer|सही उत्तर)[\s\:\-]+([A-D])/i);
          if (ansMatch) {
            correct = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
          }
          const expMatch = line.match(/(?:Exp|Explanation|व्याख्या)[\s\:\-]+(.+)/i);
          if (expMatch) {
            explanation = expMatch[1].trim();
          }
        });

        if (options.A && options.B) {
          questions.push({
            id: i,
            question: qText,
            options,
            correct_answer: correct,
            solution: explanation
          });
        }
      }
      if (questions.length > 0) return questions;
    }
  } catch (_) {}

  return [];
}
