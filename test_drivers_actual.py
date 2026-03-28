import sys
import ast

sys.path.append('backend')
from database import PROBLEMS_DB

def print_driver(prob_id):
    for stage, tracks in PROBLEMS_DB.items():
        if not isinstance(tracks, dict): continue
        for track, problems in tracks.items():
            for prob in problems:
                if prob['id'] == prob_id:
                    print(prob['python_driver_code'])

print("--- reverse-string ---")
print_driver('reverse-string')
print("--- move-zeroes ---")
print_driver('move-zeroes')
