import os
import boto3
import logging
import pytz
from datetime import datetime, timedelta
from decimal import Decimal

# Add backend to path to import other modules
import sys
sys.path.append('backend')

from database import PROBLEMS_DB
from wagers import settle_wager

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# DynamoDB Setup
USERS_TABLE = os.getenv("DYNAMODB_TABLE_NAME", "Users")
prefix = ""
if USERS_TABLE != "Users":
    if "-" in USERS_TABLE:
        prefix = USERS_TABLE.rsplit("-", 1)[0] + "-"
    elif "_" in USERS_TABLE:
        prefix = USERS_TABLE.rsplit("_", 1)[0] + "_"

POOLS_TABLE = os.getenv("POOLS_TABLE_NAME") or os.getenv("DYNAMODB_POOLS_TABLE") or f"{prefix}Pools"

dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)
users_table = dynamodb.Table(USERS_TABLE)
pools_table = dynamodb.Table(POOLS_TABLE)

PT_TZ = pytz.timezone("America/Los_Angeles")

def get_all_users():
    """Generator function to scan and yield all users from the Users table."""
    try:
        response = users_table.scan()
        for item in response.get('Items', []):
            yield item
        while 'LastEvaluatedKey' in response:
            response = users_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            for item in response.get('Items', []):
                yield item
    except Exception as e:
        logger.error(f"Error scanning users table: {e}")

def get_problem_ids_for_day(day_stage: str):
    """Gets all problem IDs for a given day (e.g., 'day_1')."""
    ids = []
    if day_stage in PROBLEMS_DB:
        for level in ['beginner', 'experienced']:
            if level in PROBLEMS_DB[day_stage]:
                ids.extend([p['id'] for p in PROBLEMS_DB[day_stage][level]])
    return list(set(ids))

def settle_daily_clear_wagers_for_day(settlement_date: datetime):
    """Settles all 'Daily Clear' wagers for a specific date using Pari-mutuel logic."""
    date_str = settlement_date.strftime("%Y-%m-%d")
    pool_id_to_settle = f"daily_{date_str}"
    
    logger.info(f"Starting settlement for Daily Clear wagers for pool: {pool_id_to_settle}")

    # Fetch the pool to get total pot
    pool_res = pools_table.get_item(Key={"pool_id": pool_id_to_settle})
    pool = pool_res.get("Item")
    if not pool:
        logger.warning(f"Pool {pool_id_to_settle} not found. Skipping.")
        return

    total_pot = pool.get("total_pot", Decimal(0))
    if total_pot <= 0:
        logger.info(f"Pool {pool_id_to_settle} has no points. Marking as resolved.")
        pools_table.update_item(
            Key={"pool_id": pool_id_to_settle},
            UpdateExpression="SET #s = :res",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":res": "resolved"}
        )
        return

    day_stage = f"day_{((settlement_date.date() - datetime(2026, 3, 29).date()).days)}"
    daily_problems = get_problem_ids_for_day(day_stage)

    if not daily_problems:
        logger.warning(f"No problems found for stage {day_stage}. Skipping settlement.")
        return

    winners = [] # List of (email, amount_bet)
    losers = []  # List of emails

    # First Pass: Identify winners and total winning bets
    for user in get_all_users():
        user_email = user.get("email")
        active_wagers = user.get("active_wagers", [])
        
        for wager in active_wagers:
            if wager.get("pool_id") == pool_id_to_settle and wager.get("prediction_type") == "daily_all_clear":
                solved_problems = user.get("solved_problems", [])
                if all(p_id in solved_problems for p_id in daily_problems):
                    winners.append((user_email, wager["amount_bet"]))
                else:
                    losers.append(user_email)

    total_winning_bets = sum(Decimal(str(w[1])) for w in winners)
    
    # Calculate Multiplier: (Total Pot * 0.95) / Total Winning Bets
    multiplier = Decimal(0)
    if total_winning_bets > 0:
        multiplier = (total_pot * Decimal("0.95")) / total_winning_bets
    
    logger.info(f"Pool {pool_id_to_settle}: Total Pot={total_pot}, Winners={len(winners)}, Winning Bets={total_winning_bets}, Multiplier={multiplier}")

    # Second Pass: Settle wagers
    for user_email, amount_bet in winners:
        winnings = (Decimal(str(amount_bet)) * multiplier).quantize(Decimal("1"))
        logger.info(f"User {user_email} WON. Payout: {winnings}")
        settle_wager(user_email, pool_id_to_settle, Decimal(str(amount_bet)), "won", explicit_winnings=winnings)

    for user_email in losers:
        logger.info(f"User {user_email} LOST.")
        # Find the wager amount to log/pass (optional but good for consistency)
        settle_wager(user_email, pool_id_to_settle, Decimal(0), "lost")

    # Finalize Pool
    pools_table.update_item(
        Key={"pool_id": pool_id_to_settle},
        UpdateExpression="SET #s = :res, total_winning_bets = :twb, multiplier = :m",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":res": "resolved",
            ":twb": total_winning_bets,
            ":m": multiplier
        }
    )

def settle_ironman_wagers():
    """Settles all 'Ironman Streak' wagers using Pari-mutuel logic."""
    pool_id_to_settle = "ironman_2026"
    logger.info(f"Starting settlement for Ironman wagers for pool: {pool_id_to_settle}")

    pool_res = pools_table.get_item(Key={"pool_id": pool_id_to_settle})
    pool = pool_res.get("Item")
    if not pool:
        logger.warning(f"Pool {pool_id_to_settle} not found. Skipping.")
        return

    total_pot = pool.get("total_pot", Decimal(0))
    
    winners = []
    losers = []

    for user in get_all_users():
        user_email = user.get("email")
        active_wagers = user.get("active_wagers", [])

        for wager in active_wagers:
            if wager.get("pool_id") == pool_id_to_settle and wager.get("prediction_type") == "ironman_streak":
                daily_streak_map = user.get("daily_streak_map", {})
                all_days_completed = all(daily_streak_map.get(f"day_{i}") for i in range(1, 8))

                if all_days_completed:
                    winners.append((user_email, wager["amount_bet"]))
                else:
                    losers.append(user_email)

    total_winning_bets = sum(Decimal(str(w[1])) for w in winners)
    multiplier = Decimal(0)
    if total_winning_bets > 0:
        multiplier = (total_pot * Decimal("0.95")) / total_winning_bets
    
    logger.info(f"Ironman Pool: Total Pot={total_pot}, Winners={len(winners)}, Winning Bets={total_winning_bets}, Multiplier={multiplier}")

    for user_email, amount_bet in winners:
        winnings = (Decimal(str(amount_bet)) * multiplier).quantize(Decimal("1"))
        settle_wager(user_email, pool_id_to_settle, Decimal(str(amount_bet)), "won", explicit_winnings=winnings)

    for user_email in losers:
        settle_wager(user_email, pool_id_to_settle, Decimal(0), "lost")

    pools_table.update_item(
        Key={"pool_id": pool_id_to_settle},
        UpdateExpression="SET #s = :res, total_winning_bets = :twb, multiplier = :m",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":res": "resolved",
            ":twb": total_winning_bets,
            ":m": multiplier
        }
    )

if __name__ == "__main__":
    # This script can be run with arguments to specify which wagers to settle.
    # For example: python settle_wagers.py --date 2026-03-30
    # or: python settle_wagers.py --ironman
    
    import argparse
    parser = argparse.ArgumentParser(description="Settle wagers for Leetcodethon.")
    parser.add_argument("--date", help="The date to settle Daily Clear wagers for, in YYYY-MM-DD format.")
    parser.add_argument("--ironman", action="store_true", help="Settle all Ironman wagers.")

    args = parser.parse_args()

    if args.date:
        try:
            settlement_date = datetime.strptime(args.date, "%Y-%m-%d").replace(tzinfo=PT_TZ)
            settle_daily_clear_wagers_for_day(settlement_date)
        except ValueError:
            logger.error("Invalid date format. Please use YYYY-MM-DD.")
    
    if args.ironman:
        settle_ironman_wagers()

    if not args.date and not args.ironman:
        logger.info("No action specified. Use --date YYYY-MM-DD to settle daily wagers or --ironman to settle final streak wagers.")
