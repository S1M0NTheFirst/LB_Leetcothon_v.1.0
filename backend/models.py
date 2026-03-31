from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Wager(BaseModel):
    pool_id: str
    amount_bet: int
    prediction_type: str # "daily_all_clear" | "ironman_streak"
    status: str = "active" # "active" | "won" | "lost"

class JoinWagerRequest(BaseModel):
    user_email: str
    amount: int
    prediction_type: str # "daily_all_clear" | "ironman_streak"

class Pool(BaseModel):
    pool_id: str
    total_pot: int
    participant_ids: List[str] # Emails
    status: str = "open" # "open" | "resolved"

class HeartbeatRequest(BaseModel):
    user_email: str
    interval_ms: int
