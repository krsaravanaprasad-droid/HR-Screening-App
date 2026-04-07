import React, { useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api/candidates/screen';

const initialJD = `We are hiring a Senior Full Stack Engineer with strong React, Node, Express, TypeScript, and AWS experience. Candidates should build scalable APIs, collaborate across teams, and deliver production-grade features.`;

function App() {
  const [jdText, setJdText] = useState(initialJD);
  const [filters, setFilters] = useState({
    minExperience: 0,
    location: '',
    minScore: 0
  });
  const [result, setResult] = useState({
    jdKeywords: [],
    candidates: [],
    totalCandidates: 0,
    matchedCandidates: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const topCandidate = useMemo(() => result.candidates[0] || null, [result.candidates]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const screenProfiles = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdText,
          filters: {
            minExperience: Number(filters.minExperience) || 0,
            location: filters.location,
            minScore: Number(filters.minScore) || 0
          }
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Unable to screen candidates.');
      }

      const payload = await response.json();
      setResult(payload);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Smart HR Profile Screener</h1>

        <label htmlFor="jdText">Job Description</label>
        <textarea
          id="jdText"
          rows="8"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste job description here"
        />

        <div className="filters">
          <div>
            <label htmlFor="minExperience">Min Experience (Years)</label>
            <input
              id="minExperience"
              type="number"
              name="minExperience"
              value={filters.minExperience}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g. Austin"
            />
          </div>

          <div>
            <label htmlFor="minScore">Min Score</label>
            <input
              id="minScore"
              type="number"
              name="minScore"
              value={filters.minScore}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <button className="screen-btn" onClick={screenProfiles} disabled={loading || !jdText.trim()}>
          {loading ? 'Screening...' : 'Screen Candidates'}
        </button>

        {error && <p className="error">{error}</p>}

        <section className="meta">
          <p>
            <strong>Extracted Keywords:</strong>{' '}
            {result.jdKeywords.length ? result.jdKeywords.join(', ') : 'No keywords yet'}
          </p>
          <p>
            <strong>Showing:</strong> {result.matchedCandidates} / {result.totalCandidates} candidates
          </p>
          {topCandidate && (
            <p>
              <strong>Top Match:</strong> {topCandidate.name} ({topCandidate.matchScore}%)
            </p>
          )}
        </section>

        <div className="results">
          {result.candidates.map((candidate) => (
            <article key={candidate.id} className="candidate-card">
              <h3>
                {candidate.name} <span>{candidate.matchScore}% Match</span>
              </h3>
              <p>
                {candidate.currentTitle} • {candidate.location} • {candidate.experienceYears} yrs
              </p>
              <p>
                <strong>Matched Skills:</strong>{' '}
                {candidate.matchedSkills.length ? candidate.matchedSkills.join(', ') : 'None'}
              </p>
              <p>
                <strong>All Skills:</strong> {candidate.skills.join(', ')}
              </p>
              <small>
                Breakdown → Skills: {candidate.scoreBreakdown.skillScore}, Experience:{' '}
                {candidate.scoreBreakdown.experienceScore}, Title: {candidate.scoreBreakdown.titleScore}
              </small>
            </article>
          ))}
          {!result.candidates.length && <p>No candidates to display yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
