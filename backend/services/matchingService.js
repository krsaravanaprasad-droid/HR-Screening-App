const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'into',
  'your',
  'our',
  'you',
  'will',
  'have',
  'has',
  'are',
  'this',
  'that',
  'who',
  'what',
  'when',
  'where',
  'why',
  'how',
  'their',
  'them',
  'they',
  'than',
  'then',
  'also',
  'must',
  'should',
  'can',
  'able',
  'using',
  'use',
  'used',
  'such',
  'looking',
  'experience',
  'developer',
  'engineer',
  'team',
  'work'
]);

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

const extractKeywords = (jdText) => {
  const tokens = tokenize(jdText);
  const freq = new Map();

  tokens.forEach((token) => {
    if (token.length < 2 || STOP_WORDS.has(token)) return;
    freq.set(token, (freq.get(token) || 0) + 1);
  });

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([token]) => token);
};

const scoreSkillOverlap = (candidateSkills, jdKeywords) => {
  const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const matched = jdKeywords.filter((k) => candidateSet.has(k.toLowerCase()));

  const coverage = jdKeywords.length ? matched.length / jdKeywords.length : 0;
  const score = Math.min(100, Math.round(coverage * 70));

  return { matchedSkills: matched, score };
};

const scoreExperience = (candidateYears, jdKeywords) => {
  const hasSeniorCue = jdKeywords.some((k) =>
    ['senior', 'lead', 'architect', 'principal'].includes(k)
  );

  const targetYears = hasSeniorCue ? 5 : 3;
  const ratio = Math.min(1, candidateYears / targetYears);
  return Math.round(ratio * 20);
};

const scoreTitleRelevance = (title, jdKeywords) => {
  const titleTokens = tokenize(title);
  const overlap = titleTokens.filter((token) => jdKeywords.includes(token)).length;
  if (!titleTokens.length) return 0;
  return Math.round(Math.min(1, overlap / titleTokens.length) * 10);
};

const scoreCandidateAgainstJD = (candidate, jdKeywords) => {
  const { matchedSkills, score: skillScore } = scoreSkillOverlap(candidate.skills, jdKeywords);
  const experienceScore = scoreExperience(candidate.experienceYears, jdKeywords);
  const titleScore = scoreTitleRelevance(candidate.currentTitle, jdKeywords);

  const matchScore = Math.min(100, skillScore + experienceScore + titleScore);

  return {
    matchedSkills,
    matchScore,
    scoreBreakdown: {
      skillScore,
      experienceScore,
      titleScore
    }
  };
};

const applyFilters = (candidates, filters) =>
  candidates.filter((candidate) => {
    const passExperience = candidate.experienceYears >= filters.minExperience;
    const passLocation =
      !filters.location || candidate.location.toLowerCase().includes(filters.location);
    const passScore = candidate.matchScore >= filters.minScore;

    return passExperience && passLocation && passScore;
  });

module.exports = {
  extractKeywords,
  scoreCandidateAgainstJD,
  applyFilters
};
