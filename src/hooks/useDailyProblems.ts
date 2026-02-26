import { useQuery } from "@tanstack/react-query";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
}

const mockFetchProblems = async (level: "beginner" | "experienced"): Promise<Problem[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (level === "beginner") {
    return [
      { id: "b1", title: "Two Sum", difficulty: "Easy", points: 1 },
      { id: "b2", title: "Palindrome Number", difficulty: "Easy", points: 2 },
      { id: "b3", title: "Roman to Integer", difficulty: "Easy", points: 3 },
      { id: "b4", title: "Longest Common Prefix", difficulty: "Easy", points: 4 },
      { id: "b5", title: "Add Two Numbers", difficulty: "Medium", points: 5 },
    ];
  } else {
    return [
      { id: "e1", title: "Valid Parentheses", difficulty: "Easy", points: 1 },
      { id: "e2", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", points: 2 },
      { id: "e3", title: "String to Integer (atoi)", difficulty: "Medium", points: 3 },
      { id: "e4", title: "Container With Most Water", difficulty: "Medium", points: 4 },
      { id: "e5", title: "Median of Two Sorted Arrays", difficulty: "Hard", points: 5 },
    ];
  }
};

export const useDailyProblems = (level: "beginner" | "experienced") => {
  return useQuery({
    queryKey: ["dailyProblems", level],
    queryFn: () => mockFetchProblems(level),
  });
};
