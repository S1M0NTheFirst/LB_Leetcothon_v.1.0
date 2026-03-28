import sys
import json
import re
import pprint

sys.path.append('backend')
from database import PROBLEMS_DB, DAY_TOPICS, LIST_NODE_DEF

def fix_driver_code(driver_code):
    # This pattern is more complex to handle different expected values.
    # It captures the expected value (True, False, a number, a string, a list, etc.)
    pattern = re.compile(r"if str\(res\)\.replace\(' ', ''\) != str\((.*?)\)\.replace\(' ', ''\) and res != (.*?):")
    
    def replacement(match):
        expected_value = match.group(2)
        # Use 'is not' for True/False, and '!=' for other values
        if expected_value in ['True', 'False']:
            return f"if res is not {expected_value}:"
        else:
            return f"if res != {expected_value}:"

    return pattern.sub(replacement, driver_code)

def fix_all_drivers():
    for stage, tracks in PROBLEMS_DB.items():
        if not isinstance(tracks, dict):
            continue
        for track, problems in tracks.items():
            for prob in problems:
                if 'python_driver_code' in prob:
                    prob['python_driver_code'] = fix_driver_code(prob['python_driver_code'])

def save_db():
    content = f"""import sys

LIST_NODE_DEF = {repr(LIST_NODE_DEF)}

DAY_TOPICS = {pprint.pformat(DAY_TOPICS)}

PROBLEMS_DB = {pprint.pformat(PROBLEMS_DB, indent=4, width=120)}
"""
    with open('backend/database.py', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_all_drivers()
    save_db()
    print("All python drivers have been fixed and saved to backend/database.py")
