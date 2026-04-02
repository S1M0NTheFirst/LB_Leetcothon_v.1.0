import requests
import json
import re
import os
from generate_drivers import generate_c_driver, generate_cpp_driver

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

def fetch_problem(slug):
    query = "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId title difficulty content codeSnippets { langSlug code } } }"
    response = requests.post(
        LEETCODE_GRAPHQL_URL,
        json={"query": query, "variables": {"titleSlug": slug}},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 200:
        data = response.json()
        if 'data' in data and data['data']['question']:
            return data['data']['question']
    return None

def clean_html(text):
    text = re.sub(r'<[^>]+>', '', text)
    return text.replace('&nbsp;', ' ').replace('&quot;', '"')

def parse_test_cases(html_content):
    cases = []
    # Match blocks like Input: ... Output: ...
    matches = re.finditer(f"""Input:?</strong>(.*?)(?:<br />|{os.linesep})?<strong>Output:?</strong>(.*?)(?:<strong>Explanation:?</strong>|<p>|<pre>|</pre>|{os.linesep}{os.linesep})""", html_content, re.IGNORECASE | re.DOTALL)
    for m in matches:
        inp = clean_html(m.group(1)).strip()
        outp = clean_html(m.group(2)).strip()
        if len(cases) < 3:
            cases.append({"input": inp, "expected": outp})
            
    if not cases:
        matches = re.finditer(f"""Input:(.*?)Output:(.*?)(?:Explanation:|{os.linesep}{os.linesep}|$)      """, clean_html(html_content), re.IGNORECASE | re.DOTALL)
        for m in matches:
            inp = m.group(1).strip()
            outp = m.group(2).strip()
            if len(cases) < 3:
                cases.append({"input": inp, "expected": outp})
                
    return cases

def extract_method_name(python_code):
    match = re.search(r'def (\w+)', python_code)
    if match:
        return match.group(1)
    return "unknown"

def parse_input_to_python_args(input_str):
    parts = input_str.split(', ')
    args = []
    kwargs = {}
    for part in parts:
        if '=' in part:
            k, v = part.split('=', 1)
            k = k.strip()
            v = v.strip()
            kwargs[k] = v
        else:
            args.append(part.strip())
    return args, kwargs

def build_driver_code(method_name, test_cases):
    driver_code = """import sys
import json
try:
    sol = Solution()
    all_passed = True
"""
    for i, tc in enumerate(test_cases):
        inp = tc['input']
        expected = tc['expected']
        expected = expected.replace("true", "True").replace("false", "False").replace("null", "None")
        args, kwargs = parse_input_to_python_args(inp)
        
        if kwargs:
            call_args = ", ".join([f"{k}={v}" for k, v in kwargs.items()])
        else:
            call_args = ", ".join(args)
            
        driver_code += f"""    # Test Case {i+1}
"""
        driver_code += f"""    res = sol.{method_name}({call_args})
"""
        driver_code += f"""    if str(res).replace(' ', '') != str({expected}).replace(' ', '') and res != {expected}:
"""
        driver_code += f"""        print(f'FAIL|Test {i+1} Failed: Expected {expected}, got {{res}}')
"""
        driver_code += f"""        all_passed = False
"""
        
    driver_code += """    if all_passed:
        print('PASS|ALL_CASES_PASSED')
"""
    driver_code += """except Exception as e:
    print(f'ERROR|Exception during execution: {e}')
"""
    
    return driver_code


JAVA_DRIVERS = {
    'two-sum': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        boolean all_passed = true;
        // Test Case 1
        {
            int[] nums = {2,7,11,15};
            int target = 9;
            int[] expected = {0,1};
            int[] res = sol.twoSum(nums, target);
            if(res == null) {
                System.out.println("FAIL|Test 1 Failed: Got null");
                all_passed = false;
            } else {
                java.util.Arrays.sort(res);
                java.util.Arrays.sort(expected);
                if (!java.util.Arrays.equals(res, expected)) {
                    System.out.println("FAIL|Test 1 Failed");
                    all_passed = false;
                }
            }
        }
        // Test Case 2
        {
            int[] nums = {3,2,4};
            int target = 6;
            int[] expected = {1,2};
            int[] res = sol.twoSum(nums, target);
            if(res == null) {
                System.out.println("FAIL|Test 2 Failed: Got null");
                all_passed = false;
            } else {
                java.util.Arrays.sort(res);
                java.util.Arrays.sort(expected);
                if (!java.util.Arrays.equals(res, expected)) {
                    System.out.println("FAIL|Test 2 Failed");
                    all_passed = false;
                }
            }
        }
        if (all_passed) System.out.println("PASS|ALL_CASES_PASSED");
    }
}
""",
    'valid-parentheses': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        if (sol.isValid("()") && sol.isValid("()[]{}") && !sol.isValid("(]")) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'palindrome-number': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        if (sol.isPalindrome(121) && !sol.isPalindrome(-121) && !sol.isPalindrome(10)) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'contains-duplicate': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {1,2,3,1};
        int[] n2 = {1,2,3,4};
        if (sol.containsDuplicate(n1) && !sol.containsDuplicate(n2)) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'remove-element': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {3,2,2,3};
        int val1 = 3;
        int res1 = sol.removeElement(n1, val1);
        if (res1 == 2) {
             System.out.println("PASS|ALL_CASES_PASSED");
        } else {
             System.out.println("FAIL|Expected 2, got " + res1);
        }
    }
}
""",
    'search-insert-position': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {1,3,5,6};
        if (sol.searchInsert(nums, 5) == 2 && sol.searchInsert(nums, 2) == 1 && sol.searchInsert(nums, 7) == 4) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'plus-one': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] d1 = {1,2,3};
        int[] r1 = sol.plusOne(d1);
        if (r1.length == 3 && r1[2] == 4) {
             System.out.println("PASS|ALL_CASES_PASSED");
        } else {
             System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'missing-number': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {3,0,1};
        if (sol.missingNumber(n1) == 2) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Expected 2");
        }
    }
}
""",
    'maximum-subarray': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {-2,1,-3,4,-1,2,1,-5,4};
        if (sol.maxSubArray(n1) == 6) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Expected 6");
        }
    }
}
""",
    'is-subsequence': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        if (sol.isSubsequence("abc", "ahbgdc") && !sol.isSubsequence("axc", "ahbgdc")) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'reverse-string': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        char[] s1 = {'h','e','l','l','o'};
        sol.reverseString(s1);
        if (s1[0] == 'o' && s1[4] == 'h') {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'move-zeroes': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {0,1,0,3,12};
        sol.moveZeroes(n1);
        if (n1[0] == 1 && n1[1] == 3 && n1[2] == 12 && n1[3] == 0 && n1[4] == 0) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'climbing-stairs': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        if (sol.climbStairs(2) == 2 && sol.climbStairs(3) == 3) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'sqrtx': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        if (sol.mySqrt(4) == 2 && sol.mySqrt(8) == 2) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'power-of-two': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        if (sol.isPowerOfTwo(1) && sol.isPowerOfTwo(16) && !sol.isPowerOfTwo(3)) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'single-number': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {2,2,1};
        int[] n2 = {4,1,2,1,2};
        if (sol.singleNumber(n1) == 1 && sol.singleNumber(n2) == 4) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'kth-largest-element-in-an-array': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] n1 = {3,2,1,5,6,4};
        int[] n2 = {3,2,3,1,2,4,5,5,6};
        if (sol.findKthLargest(n1, 2) == 5 && sol.findKthLargest(n2, 4) == 4) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
""",
    'search-a-2d-matrix': """
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[][] m1 = {{1,3,5,7},{10,11,16,20},{23,30,34,60}};
        if (sol.searchMatrix(m1, 3) && !sol.searchMatrix(m1, 13)) {
            System.out.println("PASS|ALL_CASES_PASSED");
        } else {
            System.out.println("FAIL|Test Cases Failed");
        }
    }
}
"""
}

def process_track(track_slugs):
    problems = []
    points = 1
    for slug in track_slugs:
        print(f"Fetching {slug}...")
        q = fetch_problem(slug)
        if not q:
            print(f"FAILED to fetch {slug}")
            continue
            
        snippets = q.get('codeSnippets', []) or []
        starter_code = {}
        target_langs = {'python3': 'python', 'cpp': 'cpp', 'c': 'c', 'java': 'java'}
        for s in snippets:
            if s['langSlug'] in target_langs:
                starter_code[target_langs[s['langSlug']]] = s['code']
                
        test_cases = parse_test_cases(q['content'])
        method_name = extract_method_name(starter_code.get('python', '''def unknown():
    pass'''))
        driver = build_driver_code(method_name, test_cases)

        prob_data_for_drivers = {
            "starter_code": starter_code,
        }
        
        c_driver = generate_c_driver(prob_data_for_drivers)
        cpp_driver = generate_cpp_driver(prob_data_for_drivers)
        java_driver = JAVA_DRIVERS.get(slug, "")

        prob = {
            "id": slug,
            "title": q['title'],
            "difficulty": q['difficulty'],
            "points": points,
            "description": q['content'],
            "starter_code": starter_code,
            "public_test_cases": test_cases,
            "python_driver_code": driver,
            "c_driver_code": c_driver,
            "cpp_driver_code": cpp_driver,
            "java_driver_code": java_driver
        }
        problems.append(prob)
        points += 1
    return problems

DAY_TOPICS = {
    "playground": "Warm-Up Playground",
    "day_1": "Arrays & Hashing",
    "day_2": "Two Pointers & Sliding Window",
    "day_3": "Stack & Queue",
    "day_4": "Binary Search & Math",
    "day_5": "Dynamic Programming I",
    "day_6": "Dynamic Programming II",
    "day_7": "Final Boss: Advanced Mix"
}

# Adjusted Schedule: Beginner 5th=Medium, Experienced 5th=Hard
SCHEDULE = {
    "playground": {
        "beginner": ["two-sum", "valid-parentheses", "palindrome-number", "roman-to-integer", "longest-common-prefix"],
        "experienced": ["contains-duplicate", "group-anagrams", "top-k-frequent-elements", "product-of-array-except-self", "longest-consecutive-sequence"]
    },
    "day_1": {
        "beginner": ["remove-element", "search-insert-position", "plus-one", "missing-number", "maximum-subarray"], # MaxSub is M
        "experienced": ["contains-duplicate", "product-of-array-except-self", "max-chunks-to-make-sorted", "3sum", "trapping-rain-water"] # Rain is H
    },
    "day_2": {
        "beginner": ["valid-palindrome", "is-subsequence", "reverse-string", "move-zeroes", "container-with-most-water"], # Water is M
        "experienced": ["valid-palindrome", "two-sum-ii-input-array-is-sorted", "3sum", "container-with-most-water", "minimum-window-substring"] # WinSub is H
    },
    "day_3": {
        "beginner": ["valid-parentheses", "baseball-game", "backspace-string-compare", "make-the-string-great", "evaluate-reverse-polish-notation"], # RPN is M
        "experienced": ["valid-parentheses", "min-stack", "daily-temperatures", "evaluate-reverse-polish-notation", "largest-rectangle-in-histogram"] # Histogram is H
    },
    "day_4": {
        "beginner": ["sqrtx", "count-primes", "power-of-two", "single-number", "kth-largest-element-in-an-array"], # Kth is M
        "experienced": ["search-a-2d-matrix", "find-minimum-in-rotated-sorted-array", "search-in-rotated-sorted-array", "kth-largest-element-in-an-array", "median-of-two-sorted-arrays"] # Median is H
    },
    "day_5": {
        "beginner": ["climbing-stairs", "pascals-triangle", "is-subsequence", "min-cost-climbing-stairs", "coin-change"], # Coin is M
        "experienced": ["climbing-stairs", "house-robber", "word-break", "longest-increasing-subsequence", "longest-valid-parentheses"] # ValidPar is H
    },
    "day_6": {
        "beginner": ["fibonacci-number", "divisor-game", "counting-bits", "best-time-to-buy-and-sell-stock", "partition-equal-subset-sum"], # Partition is M
        "experienced": ["unique-paths", "longest-common-subsequence", "target-sum", "coin-change-ii", "burst-balloons"] # Balloons is H
    },
    "day_7": {
        "beginner": ["merge-sorted-array", "majority-element", "find-the-duplicate-number", "sort-colors", "merge-intervals"], # Intervals is M
        "experienced": ["top-k-frequent-elements", "merge-intervals", "insert-interval", "non-overlapping-intervals", "basic-calculator"] # Calc is H
    }
}

def main():
    print("Fetching problems and building database...")
    full_db = {}
    for stage, tracks in SCHEDULE.items():
        print(f"
--- Processing {stage} ---")
        full_db[stage] = {
            "beginner": process_track(tracks["beginner"]),
            "experienced": process_track(tracks["experienced"])
        }
        
    db_content = f'''import sys

LIST_NODE_DEF = """class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
"""

DAY_TOPICS = {json.dumps(DAY_TOPICS, indent=4)}

PROBLEMS_DB = {json.dumps(full_db, indent=4)}
'''
    with open("backend/database.py", "w", encoding="utf-8") as f:
        f.write(db_content)
    print("
Successfully wrote backend/database.py")

if __name__ == "__main__":
    main()
