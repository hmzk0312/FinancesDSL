# Scenario Specification

## Purpose

Scenario は、将来の資産推移をシミュレーションするためのルールを定義する。

Scenario はシミュレーション開始前に確定し、シミュレーション中に変更されない Immutable データとして扱う。

---

## Structure

Scenario は以下の要素から構成される。

```text
Scenario
├── assumptions
├── assets
├── transfer_events
├── state_transitions
└── alert_rules
```

---

## assumptions

シミュレーション全体で利用する共通設定。

例

- シミュレーション期間
- インフレ率

---

## assets

シミュレーション対象となる資産。

各 Asset は一意な `asset_id` を持つ。

資産残高は Transfer Event と運用利回りによって変化する。

---

## transfer_events

毎月実行される資産移動ルール。

例

- 給与
- 生活費
- 投資積立
- 資産取り崩し

Transfer Event は YAML の定義順に逐次適用される。

---

## state_transitions

シミュレーション状態を変更するルール。

例

- retired
- pension_started

条件を満たした場合、一度だけ状態を変更する。

---

## alert_rules

SimulationResult に対する判定ルール。

例

- 現金不足
- FIRE達成
- 資産枯渇

Alert はシミュレーションを停止しない。

---

## Monthly Processing

Simulation は毎月以下の順序で実行される。

1. ActualObservation を反映
2. State Transition
3. Transfer Events
4. Investment Return
5. Metrics
6. Alert 判定

詳細は `execution-timeline.md` を参照する。

---

## Example

```yaml
assumptions:
  inflation_rate: 0.02

assets:
  - asset_id: cash
    type: cash
    market_value: 5000000

transfer_events:
  - name: salary
    from: external
    to: cash
    amount:
      type: fixed
      value: 400000
    schedule:
      monthly: true

state_transitions:
  - state: retired
    when:
      age_gte: 60

alert_rules:
  - name: cash_shortage
    target:
      type: metric
      key: cash_total
    condition:
      lte: 0
```

---

## Design Principles

- Scenario は Source of Truth の一つである
- Scenario は Immutable である
- 同じ入力から同じ結果を生成する
- 詳細な計算方法は Simulation Engine が担う