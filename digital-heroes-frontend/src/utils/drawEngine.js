export const countMatches = (userScores, winningNumbers) => {
  const uniqueScores = [...new Set(userScores)];

  return uniqueScores.filter((score) =>
    winningNumbers.includes(score)
  ).length;
};

export const getPrizeTier = (matchCount) => {
  if (matchCount === 5) return 40;
  if (matchCount === 4) return 35;
  if (matchCount === 3) return 25;

  return 0;
};

export const calculatePrizePerWinner = (
  prizePool,
  matchCount,
  numberOfWinners
) => {
  if (numberOfWinners === 0) return 0;

  const percentage = getPrizeTier(matchCount);

  return (prizePool * percentage) / 100 / numberOfWinners;
};