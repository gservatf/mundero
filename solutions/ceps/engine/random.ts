export const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const generateQuestionOrder = (
  totalQuestions: number = 55,
): number[] => {
  const questionIds = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  return shuffle(questionIds);
};

export const getRandomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
};

export const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
