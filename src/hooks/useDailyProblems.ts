import { useQuery } from "@tanstack/react-query";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  description?: string;
  starter_code?: Record<string, string>;
  public_test_cases?: { input: string; expected: string }[];
  stage?: string;
  topic?: string;
}

export interface DailyProblemsResponse {
  active_stage: string;
  topic: string;
  problems: Problem[];
}

export interface StageProblemsResponse {
  stage: string;
  topic: string;
  problems: Problem[];
}

const fetchProblems = async (level: "beginner" | "experienced"): Promise<DailyProblemsResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/problems/daily?level=${level}`);
  if (!response.ok) {
    throw new Error("Failed to fetch daily problems");
  }
  return response.json();
};

const fetchStageProblems = async (stage: string, level: "beginner" | "experienced"): Promise<StageProblemsResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/problems/stage/${stage}?level=${level}`);
  if (!response.ok) {
    throw new Error("Failed to fetch stage problems");
  }
  return response.json();
};

export const useDailyProblems = (level: "beginner" | "experienced") => {
  return useQuery({
    queryKey: ["dailyProblems", level],
    queryFn: () => fetchProblems(level),
  });
};

export const useStageProblems = (stage: string, level: "beginner" | "experienced") => {
  return useQuery({
    queryKey: ["stageProblems", stage, level],
    queryFn: () => fetchStageProblems(stage, level),
    enabled: !!stage,
  });
};

export const useProblem = (id: string) => {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: async (): Promise<Problem> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/problems/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch problem");
      }
      return response.json();
    },
    enabled: !!id,
  });
};
