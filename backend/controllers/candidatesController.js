const {
  extractKeywords,
  scoreCandidateAgainstJD,
  applyFilters
} = require('../services/matchingService');
const candidates = require('../data/candidates.json');

const normalizeFilters = (filters = {}) => ({
  minExperience: Number(filters.minExperience) || 0,
  location: (filters.location || '').trim().toLowerCase(),
  minScore: Number(filters.minScore) || 0
});

const screenCandidates = (req, res) => {
  const { jdText = '', filters = {} } = req.body || {};

  if (!jdText || typeof jdText !== 'string' || !jdText.trim()) {
    return res.status(400).json({ message: 'jdText is required.' });
  }

  const normalizedFilters = normalizeFilters(filters);
  const jdKeywords = extractKeywords(jdText);

  const scored = candidates.map((candidate) => {
    const result = scoreCandidateAgainstJD(candidate, jdKeywords);
    return {
      ...candidate,
      ...result
    };
  });

  const filtered = applyFilters(scored, normalizedFilters);

  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return res.json({
    jdKeywords,
    totalCandidates: candidates.length,
    matchedCandidates: filtered.length,
    candidates: filtered
  });
};

module.exports = {
  screenCandidates
};
