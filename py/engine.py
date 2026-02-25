# engine.py
# from data import ...
# from models import ...

import random
import statistics
from typing import Tuple
from models import Weapon, Accuracy


def ms_between_shots(rps: float) -> float:
    return 1000.0 / rps

def sample_hit_from_acc(acc: Accuracy, first_shot: bool) -> str:
    """
    用 Accuracy 物件中的機率，抽出這一發子彈打到哪裡。
    可能回傳: "head", "body", "legs_arms", "miss"
    """

    if first_shot:
        probs = [
            ("head",      acc.p_head_first),
            ("body",      acc.p_body_first),
            ("legs_arms", acc.p_legs_and_arms_first),
            ("miss",      acc.p_miss_first),
        ]
    else:
        probs = [
            ("head",      acc.p_head_follow),
            ("body",      acc.p_body_follow),
            ("legs_arms", acc.p_legs_and_arms_follow),
            ("miss",      acc.p_miss_follow),
        ]

    # 簡單防呆：若總和不是 1，就正規化一下
    total_p = sum(p for _, p in probs) or 1.0
    r = random.random()
    cum = 0.0
    for label, p in probs:
        cum += p / total_p
        if r < cum:
            return label
    return "miss"


def simulate_one_duel(
    t_ready_A_ms: float, t_ready_B_ms: float,
    weapA: Weapon, weapB: Weapon,
    accA: Accuracy, accB: Accuracy,
    hpA0: int = 150, hpB0: int = 150
) -> Tuple[str, float]:
    """Event-driven duel: earlier next-fire shoots, roll outcome, update HP, reschedule."""
    nextA, nextB = t_ready_A_ms, t_ready_B_ms
    stepA, stepB = ms_between_shots(weapA.rps), ms_between_shots(weapB.rps)
    firstA, firstB = True, True
    hpA, hpB = hpA0, hpB0

    while hpA > 0 and hpB > 0:
        if nextA <= nextB:
            # A fires
            outcome = sample_hit_from_acc(accA, firstA)
            firstA = False  # 第一發用完就轉成 follow

            if outcome == "head":
                hpB -= weapA.dmg_head
            elif outcome == "body":
                hpB -= weapA.dmg_body
            elif outcome == "legs_arms":
                hpB -= weapA.dmg_legs_and_arms
            # outcome == "miss" 就不扣血

            if hpB <= 0:
                return "A", nextA
            nextA += stepA
        else:
            # B fires
            outcome = sample_hit_from_acc(accB, firstB)
            firstB = False  # 第一發用完就轉成 follow

            if outcome == "head":
                hpA -= weapB.dmg_head
            elif outcome == "body":
                hpA -= weapB.dmg_body
            elif outcome == "legs_arms":
                hpA -= weapB.dmg_legs_and_arms
            # outcome == "miss" 就不扣血

            if hpA <= 0:
                return "B", nextB
            nextB += stepB

    return ("A" if hpB <= 0 else "B"), min(nextA, nextB)

def run_many_duels(
    n_trials: int,
    muA_ms: float, sigA_ms: float,
    muB_ms: float, sigB_ms: float,
    pingA_ms: float, pingB_ms: float,
    peeker_offset_ms: float, peeker_side: str,
    weapA: Weapon, weapB: Weapon,
    accA: Accuracy, accB: Accuracy,
    hpA0: int = 150, hpB0: int = 150
) -> Tuple[float, float]:
    winsA, ttks = 0, []
    for _ in range(int(n_trials)):
        rtA = random.gauss(muA_ms, sigA_ms)
        rtB = random.gauss(muB_ms, sigB_ms)
        if peeker_side.upper() == "A":
            tA0 = rtA + pingA_ms
            tB0 = rtB + pingB_ms + peeker_offset_ms
        else:
            tA0 = rtA + pingA_ms + peeker_offset_ms
            tB0 = rtB + pingB_ms

        winner, ttk = simulate_one_duel(tA0, tB0, weapA, weapB, accA, accB, hpA0, hpB0)
        winsA += (winner == "A")
        ttks.append(ttk)

    return (winsA / n_trials if n_trials else 0.0,
            statistics.median(ttks) if ttks else 0.0)
            