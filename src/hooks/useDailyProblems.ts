import { useQuery } from "@tanstack/react-query";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
}

const fetchProblems = async (level: "beginner" | "experienced"): Promise<Problem[]> => {
  const response = await fetch(`http://127.0.0.1:8005/api/problems/daily?level=${level}`);
  if (!response.ok) {
    throw new Error("Failed to fetch daily problems");
  }
  return response.json();
};

export const useDailyProblems = (level: "beginner" | "experienced") => {
  return useQuery({
    queryKey: ["dailyProblems", level],
    queryFn: () => fetchProblems(level),
  });
};
