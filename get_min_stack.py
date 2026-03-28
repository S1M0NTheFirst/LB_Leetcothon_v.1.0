
import sys
import ast

sys.path.append('backend')
from database import PROBLEMS_DB

for stage, tracks in PROBLEMS_DB.items():
    if not isinstance(tracks, dict): continue
    for track, problems in tracks.items():
        for prob in problems:
            if prob['id'] == 'min-stack':
                print(prob['python_driver_code'])
