import sys

# ListNode definition for problems involving Linked Lists
LIST_NODE_DEF = """
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def to_list(head):
    res = []
    while head:
        res.append(head.val)
        head = head.next
    return res

def from_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for i in range(1, len(arr)):
        curr.next = ListNode(arr[i])
        curr = curr.next
    return head
"""

PROBLEMS_DB = {
    "beginner": [
        {
            "id": "e1",
            "title": "Two Sum",
            "difficulty": "Easy",
            "points": 1,
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            "starter_code": {
                "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass"
            },
            "public_test_cases": [
                {"input": "nums = [2,7,11,15], target = 9", "expected": "[0,1]"},
                {"input": "nums = [3,2,4], target = 6", "expected": "[1,2]"},
                {"input": "nums = [3,3], target = 6", "expected": "[0,1]"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [
        ([2,7,11,15], 9, [0,1]),
        ([3,2,4], 6, [1,2]),
        ([3,3], 6, [0,1])
    ]
    for i, (n, t, exp) in enumerate(cases):
        res = sol.twoSum(n, t)
        
        if res is None:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got None. Did you forget to return?")
            sys.exit(0)
            
        # Ensure result is a list of integers
        try:
            actual = sorted([int(x) for x in res])
            expected = sorted([int(x) for x in exp])
        except Exception:
            print(f"FAIL|Case {i+1}: Expected list of integers like {exp}, but got {res}")
            sys.exit(0)
            
        if actual != expected:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {list(res)}")
            sys.exit(0)
            
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "e2",
            "title": "Valid Parentheses",
            "difficulty": "Easy",
            "points": 2,
            "description": "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.",
            "starter_code": {
                "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass"
            },
            "public_test_cases": [
                {"input": "s = \"()\"", "expected": "true"},
                {"input": "s = \"()[]{}\"", "expected": "true"},
                {"input": "s = \"(]\"", "expected": "false"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [(\"()\", True), (\"()[]{}\", True), (\"(]\", False), (\"([)]\", False), (\"{[]}\", True)]
    for i, (s, exp) in enumerate(cases):
        res = sol.isValid(s)
        if res != exp:
            print(f"FAIL|Case {i+1}: Input '{s}' Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "e3",
            "title": "Merge Two Sorted Lists",
            "difficulty": "Easy",
            "points": 3,
            "description": "Merge two sorted linked lists and return it as a sorted list.",
            "starter_code": {
                "python": "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        pass"
            },
            "public_test_cases": [
                {"input": "l1 = [1,2,4], l2 = [1,3,4]", "expected": "[1,1,2,3,4,4]"},
                {"input": "l1 = [], l2 = []", "expected": "[]"},
                {"input": "l1 = [], l2 = [0]", "expected": "[0]"}
            ],
            "python_driver_code": LIST_NODE_DEF + """
import sys
try:
    sol = Solution()
    cases = [
        ([1,2,4], [1,3,4], [1,1,2,3,4,4]),
        ([], [], []),
        ([], [0], [0])
    ]
    for i, (l1, l2, exp) in enumerate(cases):
        res_node = sol.mergeTwoLists(from_list(l1), from_list(l2))
        res = to_list(res_node)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "e4",
            "title": "Best Time to Buy and Sell Stock",
            "difficulty": "Easy",
            "points": 4,
            "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day. Return the maximum profit you can achieve.",
            "starter_code": {
                "python": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        pass"
            },
            "public_test_cases": [
                {"input": "prices = [7,1,5,3,6,4]", "expected": "5"},
                {"input": "prices = [7,6,4,3,1]", "expected": "0"},
                {"input": "prices = [1,2]", "expected": "1"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [
        ([7,1,5,3,6,4], 5),
        ([7,6,4,3,1], 0),
        ([1,2], 1),
        ([2,4,1], 1)
    ]
    for i, (p, exp) in enumerate(cases):
        res = sol.maxProfit(p)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "e5",
            "title": "Maximum Subarray",
            "difficulty": "Medium",
            "points": 5,
            "description": "Given an integer array `nums`, find the subarray with the largest sum and return its sum.",
            "starter_code": {
                "python": "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        pass"
            },
            "public_test_cases": [
                {"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "expected": "6"},
                {"input": "nums = [1]", "expected": "1"},
                {"input": "nums = [5,4,-1,7,8]", "expected": "23"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [
        ([-2,1,-3,4,-1,2,1,-5,4], 6),
        ([1], 1),
        ([5,4,-1,7,8], 23),
        ([-1], -1)
    ]
    for i, (n, exp) in enumerate(cases):
        res = sol.maxSubArray(n)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        }
    ],
    "experienced": [
        {
            "id": "m1",
            "title": "Contains Duplicate",
            "difficulty": "Easy",
            "points": 1,
            "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
            "starter_code": {
                "python": "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        pass"
            },
            "public_test_cases": [
                {"input": "nums = [1,2,3,1]", "expected": "true"},
                {"input": "nums = [1,2,3,4]", "expected": "false"},
                {"input": "nums = [1,1,1,3,3,4,3,2,4,2]", "expected": "true"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [([1,2,3,1], True), ([1,2,3,4], False), ([1,1,1,3,3,4,3,2,4,2], True)]
    for i, (n, exp) in enumerate(cases):
        res = sol.containsDuplicate(n)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "m2",
            "title": "Longest Substring Without Repeating Characters",
            "difficulty": "Medium",
            "points": 2,
            "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
            "starter_code": {
                "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass"
            },
            "public_test_cases": [
                {"input": "s = \"abcabcbb\"", "expected": "3"},
                {"input": "s = \"bbbbb\"", "expected": "1"},
                {"input": "s = \"pwwkew\"", "expected": "3"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [(\"abcabcbb\", 3), (\"bbbbb\", 1), (\"pwwkew\", 3), (\"\", 0), (\" \", 1)]
    for i, (s, exp) in enumerate(cases):
        res = sol.lengthOfLongestSubstring(s)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "m3",
            "title": "Product of Array Except Self",
            "difficulty": "Medium",
            "points": 3,
            "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.",
            "starter_code": {
                "python": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        pass"
            },
            "public_test_cases": [
                {"input": "nums = [1,2,3,4]", "expected": "[24,12,8,6]"},
                {"input": "nums = [-1,1,0,-3,3]", "expected": "[0,0,9,0,0]"},
                {"input": "nums = [0,0]", "expected": "[0,0]"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [
        ([1,2,3,4], [24,12,8,6]),
        ([-1,1,0,-3,3], [0,0,9,0,0]),
        ([0,0], [0,0])
    ]
    for i, (n, exp) in enumerate(cases):
        res = sol.productExceptSelf(n)
        if res is None:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got None")
            sys.exit(0)
        
        actual = [int(x) for x in res]
        if actual != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {actual}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "m4",
            "title": "Coin Change",
            "difficulty": "Medium",
            "points": 4,
            "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
            "starter_code": {
                "python": "class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        pass"
            },
            "public_test_cases": [
                {"input": "coins = [1,2,5], amount = 11", "expected": "3"},
                {"input": "coins = [2], amount = 3", "expected": "-1"},
                {"input": "coins = [1], amount = 0", "expected": "0"}
            ],
            "python_driver_code": """
import sys
try:
    sol = Solution()
    cases = [
        ([1,2,5], 11, 3),
        ([2], 3, -1),
        ([1], 0, 0)
    ]
    for i, (c, a, exp) in enumerate(cases):
        res = sol.coinChange(c, a)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        },
        {
            "id": "h1",
            "title": "Merge k Sorted Lists",
            "difficulty": "Hard",
            "points": 5,
            "description": "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            "starter_code": {
                "python": "class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        pass"
            },
            "public_test_cases": [
                {"input": "lists = [[1,4,5],[1,3,4],[2,6]]", "expected": "[1,1,2,3,4,4,5,6]"},
                {"input": "lists = []", "expected": "[]"},
                {"input": "lists = [[]]", "expected": "[]"}
            ],
            "python_driver_code": LIST_NODE_DEF + """
import sys
try:
    sol = Solution()
    cases = [
        ([[1,4,5],[1,3,4],[2,6]], [1,1,2,3,4,4,5,6]),
        ([], []),
        ([[]], [])
    ]
    for i, (ls, exp) in enumerate(cases):
        nodes = [from_list(l) for l in ls]
        res_node = sol.mergeKLists(nodes)
        res = to_list(res_node)
        if res != exp:
            print(f"FAIL|Case {i+1}: Expected {exp}, but got {res}")
            sys.exit(0)
    print("PASS|ALL_CASES_PASSED")
except Exception as e:
    print(f"ERROR|{str(e)}")
"""
        }
    ]
}
