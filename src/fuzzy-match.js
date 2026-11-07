/**
 * Fuzzy matching and string normalization for text input mode.
 * Handles single-letter typos, case differences, and 'ё' / 'е' substitution.
 */

export function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standard Levenshtein Distance calculation
 */
export function levenshteinDistance(a, b) {
  const s1 = normalizeText(a);
  const s2 = normalizeText(b);

  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[s2.length][s1.length];
}

/**
 * Check user input against target answer and valid variations
 */
export function checkAnswerFuzzy(userInput, targetAnswer, acceptableList = []) {
  const normInput = normalizeText(userInput);
  if (!normInput) {
    return { isCorrect: false, isExact: false, distance: 99, matchedAnswer: targetAnswer };
  }

  const allTargets = [targetAnswer, ...acceptableList].map(t => normalizeText(t)).filter(Boolean);

  let bestDistance = Infinity;
  let matchedTarget = targetAnswer;

  for (const target of allTargets) {
    if (normInput === target) {
      return { isCorrect: true, isExact: true, distance: 0, matchedAnswer: target };
    }

    const dist = levenshteinDistance(normInput, target);
    if (dist < bestDistance) {
      bestDistance = dist;
      matchedTarget = target;
    }
  }

  // Allowed tolerance based on word length
  const targetLen = matchedTarget.length;
  let maxAllowedErrors = 0;
  if (targetLen >= 5 && targetLen <= 8) {
    maxAllowedErrors = 1;
  } else if (targetLen > 8) {
    maxAllowedErrors = 2;
  }

  const isCorrect = bestDistance <= maxAllowedErrors;
  return {
    isCorrect,
    isExact: bestDistance === 0,
    distance: bestDistance,
    matchedAnswer: matchedTarget
  };
}
