from dataclasses import dataclass # dataclass for player stats

@dataclass
class PlayerStats:
    name: str
    health: "HealthAmount"
    armor: "ArmorAmount"

@dataclass
class HealthAmount:
    HP_50: int = 50
    HP_75: int = 75
    HP_100: int = 100

@dataclass
class ArmorAmount:
    Armor_0: int = 0
    Armor_25: int = 25
    Armor_50: int = 50

@dataclass
class Weapon:
    name: str
    dmg_head: int
    dmg_body: int
    dmg_legs_and_arms: int
    rps: float # rounds per second # float 可以接受小數點
    mag: int
    reload_time: float

@dataclass
class Accuracy:
    # Probabilities should sum to 1 for each triple
    p_head_first: float
    p_body_first: float
    p_legs_and_arms_first: float
    p_miss_first: float
    p_head_follow: float
    p_body_follow: float
    p_legs_and_arms_follow: float
    p_miss_follow: float