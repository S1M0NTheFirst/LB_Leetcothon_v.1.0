import sys
import json
import re

sys.path.append('backend')
from database import PROBLEMS_DB

def inspect_problem(problem_id):
    for stage, tracks in PROBLEMS_DB.items():
        if not isinstance(tracks, dict): continue
        for track, problems in tracks.items():
            for prob in problems:
                if prob['id'] == problem_id:
                    print(f"[{stage}][{track}] {problem_id}")
                    for lang in ['python', 'c', 'cpp', 'java']:
                        code = prob.get(f'{lang}_driver_code', '')
                        if code:
                            print(f"\n--- {lang.upper()} ---")
                            print(code)
                    print("="*60)

inspect_problem('reverse-string')
inspect_problem('move-zeroes')
inspect_problem('min-stack')
inspect_problem('power-of-two')
inspect_problem('merge-sorted-array')
inspect_problem('sort-colors')
