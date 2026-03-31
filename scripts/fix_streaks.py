import boto3
import os
from dotenv import load_dotenv

# Load .env variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "Users")

def fix_streaks():
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    table = dynamodb.Table(TABLE_NAME)
    
    print(f"Scanning table: {TABLE_NAME}...")
    
    response = table.scan()
    items = response.get('Items', [])
    
    count = 0
    for item in items:
        email = item.get('email')
        daily_streak_map = item.get('daily_streak_map', {})
        
        updated = False
        # Only day_1 and day_2 should be allowed to be True currently (since it's March 31)
        for day in ['day_3', 'day_4', 'day_5', 'day_6', 'day_7']:
            if daily_streak_map.get(day) is True:
                daily_streak_map[day] = False
                updated = True
        
        if updated:
            table.update_item(
                Key={'email': email},
                UpdateExpression="SET daily_streak_map = :ds",
                ExpressionAttributeValues={':ds': daily_streak_map}
            )
            print(f"Fixed streaks for {email}")
            count += 1
            
    print(f"Finished. Fixed {count} users.")

if __name__ == "__main__":
    fix_streaks()
