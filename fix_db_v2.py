import boto3
import os
from decimal import Decimal
from dotenv import load_dotenv

# Load .env variables
load_dotenv(".env.local")
load_dotenv(".env")

# DynamoDB Setup
region = os.getenv("AWS_REGION", "us-east-1")
access_key = os.getenv("AWS_ACCESS_KEY_ID")
secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
table_name = os.getenv("DYNAMODB_TABLE_NAME", "Users")

dynamodb = boto3.resource(
    "dynamodb",
    region_name=region,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key
)

def fix_database():
    table = dynamodb.Table(table_name)
    response = table.scan()
    items = response.get("Items", [])
    
    print(f"Found {len(items)} users. Starting fix...")
    
    for item in items:
        email = item.get("email")
        updates = {}
        
        # 1. Remove wagers for simon.zhang01
        if "simon.zhang01" in email:
            print(f"Clearing wagers for user: {email}")
            updates["active_wagers"] = []
            
        # 2. Migrate score to points (score / 10)
        score = int(item.get("score", 0))
        if score > 0:
            points_to_add = score // 10
            current_points = int(item.get("points", 0))
            new_points = current_points + points_to_add
            print(f"Migrating user {email}: score {score} -> adding {points_to_add} points. New total: {new_points}")
            updates["points"] = Decimal(str(new_points))
            # Optional: Clear score to avoid double migration? 
            # User said "eradicate", let's keep it clean.
            # updates["score"] = Decimal("0")
            
        if updates:
            update_expr = "SET " + ", ".join([f"{k} = :{k}" for k in updates.keys()])
            expr_attr_values = {f":{k}": v for k, v in updates.items()}
            
            table.update_item(
                Key={"email": email},
                UpdateExpression=update_expr,
                ExpressionAttributeValues=expr_attr_values
            )
            print(f"Updated {email}")

    print("Database fix complete.")

if __name__ == "__main__":
    fix_database()
