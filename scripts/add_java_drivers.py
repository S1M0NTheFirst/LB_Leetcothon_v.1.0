
import sys
import pprint
import json

sys.path.append('backend')
from database import PROBLEMS_DB, DAY_TOPICS, LIST_NODE_DEF

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

def main():
    updated_count = 0
    for stage in PROBLEMS_DB:
        if not isinstance(PROBLEMS_DB[stage], dict): continue
        for track in PROBLEMS_DB[stage]:
            for prob in PROBLEMS_DB[stage][track]:
                if prob['id'] in JAVA_DRIVERS:
                    prob['java_driver_code'] = JAVA_DRIVERS[prob['id']]
                    updated_count += 1

    print(f"Updated {updated_count} problems with Java drivers.")
    
    with open('backend/database.py', 'w', encoding='utf-8') as f:
        f.write("import sys\n\n")
        f.write('LIST_NODE_DEF = """class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n"""\n\n')
        f.write(f"DAY_TOPICS = {pprint.pformat(DAY_TOPICS, indent=4)}\n\n")
        f.write(f"PROBLEMS_DB = {pprint.pformat(PROBLEMS_DB, indent=4)}\n")

if __name__ == "__main__":
    main()
