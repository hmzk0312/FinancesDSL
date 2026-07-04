# Execution Timeline Specification

## Purpose

Execution Timeline は、Simulation が1か月をどのような順序で処理するかを定義する。

各ステップの詳細な計算方法は、それぞれの Specification に委譲する。

---

## Monthly Processing

Simulation は毎月以下の順序で実行する。

```text
ActualObservation
        ↓
State Transition
        ↓
Transfer Events
        ↓
Investment Return
        ↓
Metrics
        ↓
Alerts
        ↓
Next Month
```

---

## 1. ActualObservation

`observed_at` が現在のシミュレーション月と一致する場合、Observation を SimulationState に反映する。

Observation が存在しない Asset は現在の SimulationState をそのまま利用する。

詳細は `actual-observation.md` を参照する。

---

## 2. State Transition

状態遷移ルールを評価する。

条件を満たした場合、一度だけ状態を更新する。

State Transition は Transfer Events より前に実行する。

例

- retired
- pension_started

詳細は `scenario.md` を参照する。

---

## 3. Transfer Events

Transfer Event を実行する。

Transfer Event は YAML の定義順に逐次適用する。

前の Event の結果は、次の Event の入力となる。

例

- 給与
- 年金
- 生活費
- 積立投資
- 資産取り崩し

---

## 4. Investment Return

投資資産へ運用利回りを適用する。

適用方法や計算式は Asset の Return Profile に従う。

---

## 5. Metrics

SimulationState から Metrics を計算する。

例

- total_assets
- cash_total
- liquid_assets
- after_tax_liquid_assets

Metrics は SimulationState を変更しない。

詳細は `metrics-and-alerts.md` を参照する。

---

## 6. Alerts

Alert Rule を評価する。

Alert は Simulation を停止せず、SimulationResult に記録する。

例

- 現金不足
- FIRE 達成
- 資産枯渇

詳細は `metrics-and-alerts.md` を参照する。

---

## 7. Next Month

SimulationState を翌月へ進める。

月の進行に伴い、

- 年齢
- シミュレーション年月

などを更新し、次のループを開始する。

---

## Rules

- Monthly Processing の順序は固定とする
- 各 Step は前 Step の結果を入力とする
- Step の途中で過去 Step を再実行しない
- 同一入力から同一結果を生成する

---

## Design Principles

- 月次処理は逐次実行する
- Transfer Events は YAML 定義順に評価する
- Metrics と Alerts は SimulationState を変更しない
- SimulationResult は毎月の SimulationState を蓄積した導出データである