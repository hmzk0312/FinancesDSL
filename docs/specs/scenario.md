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

シミュレーション全体に一つだけ存在する前提条件であり共通設定。

Asset固有の性質やTransferEvent固有の設定は置かない。

例

- シミュレーション期間
- インフレ率

---

## assets

シミュレーション対象となる資産。

各 Asset は一意な `asset_id` を持つ。

資産残高は Transfer Event と運用利回りによって変化する。

- `type` は使わない。
- `return_profile` で利回りを定義する。
- `return_profile` は `type: fixed` と `annual_rate: number` の最小仕様を持つ。

---

## transfer_events

毎月評価される資産移動ルール。

例

- 給与
- 生活費
- 投資積立
- 資産取り崩し

Transfer Event は YAML の定義順に逐次適用される。

- `id` を持つ。
- `amount.type` は `fixed` または `inflation_adjusted`。
- `schedule.type` は `once` / `monthly` / `yearly`。
- `condition` は `state` / `age` / `value` を持ち、すべて AND で評価する。
- 条件不成立時は skip する。

---

## state_transitions

シミュレーション状態を変更するルール。

例

- retired
- pension_started

- `id` を持つ。
- `when` ではなく `condition` を使う。
- 条件を満たした場合に一度だけ状態を更新する。

---

## alert_rules

SimulationResult に対する判定ルール。

例

- 現金不足
- FIRE達成
- 資産枯渇

- `id` を持つ。
- `purpose` を使う。
- `target` は `type` と `id` で参照する。
- `condition` は `eq` / `gte` / `lte` を使う。

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
    market_value: 5000000

transfer_events:
  - id: salary
    from: external
    to: cash
    amount:
      type: fixed
      value: 400000
    schedule:
      type: monthly

state_transitions:
  - id: retired_at_60
    state: retired
    condition:
      age:
        gte: 60

alert_rules:
  - id: cash_shortage
    target:
      type: metric
      id: cash_total
    condition:
      value:
        target:
          type: metric
          id: cash_total
        operator: lte
        value: 0
    purpose: warning
```

---

## Design Principles

- Scenario は Source of Truth の一つである
- Scenario は Immutable である
- 同じ入力から同じ結果を生成する
- 詳細な計算方法は Simulation Engine が担う