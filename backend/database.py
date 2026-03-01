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
            "description": """<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [2,7,11,15], target = 9 <strong>Output:</strong> [0,1]</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
                "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
                "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
                "c": "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}"
            },
            "public_test_cases": [{"input": "nums = [2,7,11,15], target = 9", "expected": "[0,1]"}],
            "python_driver_code": """
import sys
sol = Solution()
res = sol.twoSum([2,7,11,15], 9)
if sorted(res) == [0,1]: print("PASS|ALL_CASES_PASSED")
else: print(f"FAIL|Expected [0,1], got {res}")
"""
        },
        {
            "id": "e2",
            "title": "Valid Parentheses",
            "difficulty": "Easy",
            "points": 2,
            "description": """<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> s = "()" <strong>Output:</strong> true</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def isValid(self, s: str) -> bool:\n        ",
                "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
                "java": "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
                "c": "bool isValid(char* s) {\n    \n}"
            },
            "public_test_cases": [{"input": "s = \"()\"", "expected": "true"}],
            "python_driver_code": """
import sys
sol = Solution()
if sol.isValid("()") == True and sol.isValid("(]") == False: print("PASS|ALL_CASES_PASSED")
else: print("FAIL|Validation failed")
"""
        },
        {
            "id": "e3",
            "title": "Palindrome Number",
            "difficulty": "Easy",
            "points": 3,
            "description": """<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a <strong>palindrome</strong>, and <code>false</code> otherwise.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> x = 121 <strong>Output:</strong> true</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        ",
                "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};",
                "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}",
                "c": "bool isPalindrome(int x) {\n    \n}"
            },
            "public_test_cases": [{"input": "x = 121", "expected": "true"}],
            "python_driver_code": """
import sys
sol = Solution()
if sol.isPalindrome(121) == True and sol.isPalindrome(-121) == False: print("PASS|ALL_CASES_PASSED")
else: print("FAIL|Validation failed")
"""
        },
        {
            "id": "e4",
            "title": "Roman to Integer",
            "difficulty": "Easy",
            "points": 4,
            "description": """<p>Roman numerals are represented by seven different symbols: <code>I, V, X, L, C, D, M</code>.</p>
<p>Convert a roman numeral string to an integer.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> s = "III" <strong>Output:</strong> 3</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def romanToInt(self, s: str) -> int:\n        ",
                "cpp": "class Solution {\npublic:\n    int romanToInt(string s) {\n        \n    }\n};",
                "java": "class Solution {\n    public int romanToInt(String s) {\n        \n    }\n}",
                "c": "int romanToInt(char* s) {\n    \n}"
            },
            "public_test_cases": [{"input": "s = \"III\"", "expected": "3"}],
            "python_driver_code": """
import sys
sol = Solution()
if sol.romanToInt("III") == 3 and sol.romanToInt("MCMXCIV") == 1994: print("PASS|ALL_CASES_PASSED")
else: print("FAIL|Validation failed")
"""
        },
        {
            "id": "e5",
            "title": "Longest Common Prefix",
            "difficulty": "Easy",
            "points": 5,
            "description": """<p><span class='text-[#FFC72C] font-bold'>BONUS CHALLENGE:</span> Write a function to find the longest common prefix string amongst an array of strings.</p>
<p>If there is no common prefix, return an empty string <code>""</code>.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> strs = ["flower","flow","flight"] <strong>Output:</strong> "fl"</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def longestCommonPrefix(self, strs: List[str]) -> str:\n        ",
                "cpp": "class Solution {\npublic:\n    string longestCommonPrefix(vector<string>& strs) {\n        \n    }\n};",
                "java": "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        \n    }\n}",
                "c": "char* longestCommonPrefix(char** strs, int strsSize) {\n    \n}"
            },
            "public_test_cases": [{"input": "strs = [\"flower\",\"flow\",\"flight\"]", "expected": "\"fl\""}],
            "python_driver_code": """
import sys
sol = Solution()
if sol.longestCommonPrefix(["flower","flow","flight"]) == "fl": print("PASS|ALL_CASES_PASSED")
else: print("FAIL|Validation failed")
"""
        }
    ],
    "experienced": [
        {
            "id": "m1",
            "title": "Contains Duplicate",
            "difficulty": "Easy",
            "points": 1,
            "description": """<p>Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [1,2,3,1] <strong>Output:</strong> true</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        ",
                "cpp": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};",
                "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}",
                "c": "bool containsDuplicate(int* nums, int numsSize) {\n    \n}"
            },
            "public_test_cases": [{"input": "nums = [1,2,3,1]", "expected": "true"}],
            "python_driver_code": """
import sys
sol = Solution()
if sol.containsDuplicate([1,2,3,1]) == True: print("PASS|ALL_CASES_PASSED")
else: print("FAIL|Validation failed")
"""
        },
        {
            "id": "m2",
            "title": "Group Anagrams",
            "difficulty": "Medium",
            "points": 2,
            "description": """<p>Given an array of strings <code>strs</code>, group the <strong>anagrams</strong> together. You can return the answer in any order.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> strs = ["eat","tea","tan","ate","nat","bat"]
<strong>Output:</strong> [["bat"],["nat","tan"],["ate","eat","tea"]]</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        ",
                "cpp": "class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        \n    }\n};",
                "java": "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}",
                "c": "char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {\n    \n}"
            },
            "public_test_cases": [{"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "expected": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}]
        },
        {
            "id": "m3",
            "title": "Top K Frequent Elements",
            "difficulty": "Medium",
            "points": 3,
            "description": """<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return <em>the</em> <code>k</code> <em>most frequent elements</em>.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [1,1,1,2,2,3], k = 2 <strong>Output:</strong> [1,2]</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        ",
                "cpp": "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        \n    }\n};",
                "java": "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        \n    }\n}",
                "c": "int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {\n    \n}"
            },
            "public_test_cases": [{"input": "nums = [1,1,1,2,2,3], k = 2", "expected": "[1,2]"}]
        },
        {
            "id": "m4",
            "title": "Product of Array Except Self",
            "difficulty": "Medium",
            "points": 4,
            "description": """<p>Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>.</p>
<p>You must write an algorithm that runs in <code>O(n)</code> time.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [1,2,3,4] <strong>Output:</strong> [24,12,8,6]</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        ",
                "cpp": "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};",
                "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}",
                "c": "int* productExceptSelf(int* nums, int numsSize, int* returnSize) {\n    \n}"
            },
            "public_test_cases": [{"input": "nums = [1,2,3,4]", "expected": "[24,12,8,6]"}]
        },
        {
            "id": "m5",
            "title": "Longest Consecutive Sequence",
            "difficulty": "Medium",
            "points": 5,
            "description": """<p><span class='text-[#FFC72C] font-bold'>BONUS CHALLENGE:</span> Given an unsorted array of integers <code>nums</code>, return the length of the longest consecutive elements sequence.</p>
<p>You must write an algorithm that runs in <code>O(n)</code> time.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [100,4,200,1,3,2] <strong>Output:</strong> 4</pre>""",
            "starter_code": {
                "python": "class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        ",
                "cpp": "class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        \n    }\n};",
                "java": "class Solution {\n    public int longestConsecutive(int[] nums) {\n        \n    }\n}",
                "c": "int longestConsecutive(int* nums, int numsSize) {\n    \n}"
            },
            "public_test_cases": [{"input": "nums = [100,4,200,1,3,2]", "expected": "4"}]
        }
    ]
}
