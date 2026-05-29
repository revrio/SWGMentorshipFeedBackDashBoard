export const SCORING_WEIGHTS = Object.freeze({
  feedback: 0.65,
  engagement: 0.35,
});

export function calculateFinalScore({ averageRating, responsesReceived, totalMentees }) {
  if (!totalMentees) return 0;

  const feedbackScore = (averageRating / 5) * 100;
  const engagementScore = (responsesReceived / totalMentees) * 100;

  return (
    SCORING_WEIGHTS.feedback * feedbackScore +
    SCORING_WEIGHTS.engagement * engagementScore
  );
}

export function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return `${Number(value).toFixed(1)} / 100`;
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return `${Number(value).toFixed(1)}%`;
}

export function formatRating(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return `${Number(value).toFixed(2)} / 5`;
}
