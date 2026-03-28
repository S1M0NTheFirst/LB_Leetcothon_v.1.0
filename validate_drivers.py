import sys
import ast

# Add backend to path so we can import database
sys.path.append('backend')
try:
    from database import PROBLEMS_DB
except Exception as e:
    print(f"Failed to import database: {e}")
    sys.exit(1)

for stage, tracks in PROBLEMS_DB.items():
    if not isinstance(tracks, dict):
        continue
    for track, problems in tracks.items():
        for prob in problems:
            driver = prob.get('python_driver_code', '')
            try:
                ast.parse(driver)
            except SyntaxError as e:
                print(f"[{stage}][{track}] Problem {prob['id']} has INVALID Python syntax:")
                print(f"Error: {e}")
                print(driver)
                print("-" * 40)
            
            # Additional heuristic checks
            if 'sol.reverseString(' in driver or 'sol.moveZeroes(' in driver or 'sol.merge(' in driver or 'sol.sortColors(' in driver:
                print(f"[{stage}][{track}] Problem {prob['id']} might have in-place bug in driver.")
            if 'sol.__init__(' in driver:
                print(f"[{stage}][{track}] Problem {prob['id']} has __init__ bug in driver.")
            
            # Check for generic order issues or True/False literal issues that passed ast
            if 'Explanation' in driver:
                 print(f"[{stage}][{track}] Problem {prob['id']} has 'Explanation' in driver.")
            if 'null' in driver:
                 print(f"[{stage}][{track}] Problem {prob['id']} has 'null' in driver.")
