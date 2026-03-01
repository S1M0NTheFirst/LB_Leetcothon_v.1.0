import { LeetCode } from "leetcode-query";

async function fetchProblem(slug: string) {
  const leetcode = new LeetCode();
  const problem = await leetcode.problem(slug);

  if (!problem) {
    console.error(`Problem "${slug}" not found.`);
    return;
  }

  // Filter snippets for Python, C, C++, and Java
  const targetLangs = ["python3", "cpp", "c", "java"];
  const snippets = problem.codeSnippets?.filter(s => targetLangs.includes(s.langSlug)) || [];

  const data = {
    id: problem.questionId,
    title: problem.title,
    difficulty: problem.difficulty,
    description: problem.content, // This is HTML
    sample_test: problem.sampleTestCase,
    starter_code: snippets.reduce((acc, s) => {
      // Map leetcode langSlugs to our app's IDs
      const map: Record<string, string> = { 
        "python3": "python", 
        "cpp": "cpp", 
        "c": "c", 
        "java": "java" 
      };
      acc[map[s.langSlug]] = s.code;
      return acc;
    }, {} as Record<string, string>),
    public_test_cases: [
        // We'll put the sample case here. 
        // Note: Real LeetCode has many, but this is a good start.
        { input: problem.sampleTestCase, expected: "TBD" } 
    ]
  };

  console.log(JSON.stringify(data, null, 2));
}

const slug = process.argv[2] || "two-sum";
fetchProblem(slug);
