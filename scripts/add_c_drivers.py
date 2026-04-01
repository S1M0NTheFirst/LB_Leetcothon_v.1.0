import sys
import pprint

sys.path.append('backend')
from database import PROBLEMS_DB, DAY_TOPICS, LIST_NODE_DEF

DRIVERS = {
    'remove-element': """
int main() {
    int nums1[] = {3, 2, 2, 3};
    int res1 = removeElement(nums1, 4, 3);
    if (res1 != 2) {
        printf("FAIL|Test 1 Failed: Expected 2, got %d\\n", res1);
        return 0;
    }
    
    int nums2[] = {0, 1, 2, 2, 3, 0, 4, 2};
    int res2 = removeElement(nums2, 8, 2);
    if (res2 != 5) {
        printf("FAIL|Test 2 Failed: Expected 5, got %d\\n", res2);
        return 0;
    }
    
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'search-insert-position': """
int main() {
    int nums1[] = {1, 3, 5, 6};
    int res1 = searchInsert(nums1, 4, 5);
    if (res1 != 2) {
        printf("FAIL|Test 1 Failed: Expected 2, got %d\\n", res1);
        return 0;
    }
    
    int res2 = searchInsert(nums1, 4, 2);
    if (res2 != 1) {
        printf("FAIL|Test 2 Failed: Expected 1, got %d\\n", res2);
        return 0;
    }
    
    int res3 = searchInsert(nums1, 4, 7);
    if (res3 != 4) {
        printf("FAIL|Test 3 Failed: Expected 4, got %d\\n", res3);
        return 0;
    }
    
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'plus-one': """
int main() {
    int digits1[] = {1, 2, 3};
    int returnSize1;
    int* res1 = plusOne(digits1, 3, &returnSize1);
    if (returnSize1 != 3 || res1[0] != 1 || res1[1] != 2 || res1[2] != 4) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    free(res1);

    int digits2[] = {9};
    int returnSize2;
    int* res2 = plusOne(digits2, 1, &returnSize2);
    if (returnSize2 != 2 || res2[0] != 1 || res2[1] != 0) {
        printf("FAIL|Test 2 Failed\\n");
        return 0;
    }
    free(res2);
    
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'missing-number': """
int main() {
    int nums1[] = {3, 0, 1};
    int res1 = missingNumber(nums1, 3);
    if (res1 != 2) {
        printf("FAIL|Test 1 Failed: Expected 2, got %d\\n", res1);
        return 0;
    }
    
    int nums2[] = {0, 1};
    int res2 = missingNumber(nums2, 2);
    if (res2 != 2) {
        printf("FAIL|Test 2 Failed: Expected 2, got %d\\n", res2);
        return 0;
    }
    
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'maximum-subarray': """
int main() {
    int nums1[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    int res1 = maxSubArray(nums1, 9);
    if (res1 != 6) {
        printf("FAIL|Test 1 Failed: Expected 6, got %d\\n", res1);
        return 0;
    }
    
    int nums2[] = {1};
    int res2 = maxSubArray(nums2, 1);
    if (res2 != 1) {
        printf("FAIL|Test 2 Failed: Expected 1, got %d\\n", res2);
        return 0;
    }
    
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'contains-duplicate': """
int main() {
    int nums1[] = {1, 2, 3, 1};
    if (!containsDuplicate(nums1, 4)) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    
    int nums2[] = {1, 2, 3, 4};
    if (containsDuplicate(nums2, 4)) {
        printf("FAIL|Test 2 Failed\\n");
        return 0;
    }
    
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'two-sum': """
int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* res = twoSum(nums, 4, target, &returnSize);
    if (returnSize != 2 || res[0] != 0 || res[1] != 1) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    free(res);
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'reverse-string': """
int main() {
    char s1[] = "hello";
    reverseString(s1, 5);
    if (strcmp(s1, "olleh") != 0) {
        printf("FAIL|Test 1 Failed: Expected olleh, got %s\\n", s1);
        return 0;
    }
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'palindrome-number': """
int main() {
    if (!isPalindrome(121)) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    if (isPalindrome(-121)) {
        printf("FAIL|Test 2 Failed\\n");
        return 0;
    }
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'fizz-buzz': """
int main() {
    int returnSize;
    char** res = fizzBuzz(3, &returnSize);
    if (returnSize != 3 || strcmp(res[0], "1") != 0 || strcmp(res[1], "2") != 0 || strcmp(res[2], "Fizz") != 0) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    for(int i=0; i<returnSize; i++) free(res[i]);
    free(res);
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'valid-parentheses': """
int main() {
    if (!isValid("()")) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    if (isValid("([)]")) {
        printf("FAIL|Test 2 Failed\\n");
        return 0;
    }
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'roman-to-integer': """
int main() {
    if (romanToInt("III") != 3) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    if (romanToInt("LVIII") != 58) {
        printf("FAIL|Test 2 Failed\\n");
        return 0;
    }
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
""",
    'longest-common-prefix': """
int main() {
    char* strs[] = {"flower","flow","flight"};
    char* res = longestCommonPrefix(strs, 3);
    if (strcmp(res, "fl") != 0) {
        printf("FAIL|Test 1 Failed\\n");
        return 0;
    }
    printf("PASS|ALL_CASES_PASSED\\n");
    return 0;
}
"""
}

def add_drivers():
    for stage, tracks in PROBLEMS_DB.items():
        if not isinstance(tracks, dict):
            continue
        for track, problems in tracks.items():
            for prob in problems:
                if prob['id'] in DRIVERS:
                    prob['c_driver_code'] = DRIVERS[prob['id']]
                    print(f"Added C driver for {prob['id']}")

def save_db():
    content = f"""import sys

LIST_NODE_DEF = {repr(LIST_NODE_DEF)}

DAY_TOPICS = {pprint.pformat(DAY_TOPICS)}

PROBLEMS_DB = {pprint.pformat(PROBLEMS_DB, indent=4, width=120)}
"""
    with open('backend/database.py', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    add_drivers()
    save_db()
    print("C drivers have been added and saved to backend/database.py")
