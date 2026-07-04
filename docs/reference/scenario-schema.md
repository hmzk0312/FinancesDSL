# Scenario Schema Reference

## Purpose

本ドキュメントは、Scenario YAML のスキーマを定義する。

各要素の役割は `scenario.md` を参照する。

---

## Top Level

```yaml
assumptions:
assets:
transfer_events:
state_transitions:
alert_rules:
```

---

## assumptions

シミュレーション全体で利用する共通設定。

### Schema

```yaml
assumptions:
  birth_date: YYYY-MM-DD
  simulation_start_month: YYYY-MM-01
  simulation_end_age: 95
  inflation_rate: number
  tax_rates:
    capital_gains: number
```

### Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| birth_date | string | ✓ | 生年月日 |
| simulation_start_month | string | ✓ | シミュレーション開始年月 |
| simulation_end_age | integer | ✓ | シミュレーション終了年齢 |
| inflation_rate | number | ✓ | 年間インフレ率 |
| tax_rates.capital_gains | number | ✓ | 譲渡益課税率 |

---

## assets

シミュレーション対象となる資産。

### Schema

```yaml
assets:
  - asset_id: cash
    market_value: 5000000
    cost_basis: 5000000
    liquidity_profile: cash
    tax_profile: none
    return_profile:
      type: fixed
      annual_rate: 0.001
```

### Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| asset_id | string | ✓ | Asset を識別する ID |
| market_value | number | ✓ | 現在評価額 |
| cost_basis | number | | 取得価格 |
| liquidity_profile | string | ✓ | 流動性区分 |
| tax_profile | string | ✓ | 税区分 |
| return_profile | object | ✓ | 利回り定義 |

### return_profile

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| type | string | ✓ | 利回りタイプ (`fixed`) |
| annual_rate | number | ✓ | 年率 |

---

## transfer_events

毎月評価される資産移動ルール。

### Schema

```yaml
transfer_events:
  - id: salary
    from: external
    to: cash
    amount:
      type: fixed
      value: 400000
    schedule:
      type: monthly
```

### Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | ✓ | Event ID |
| from | string | ✓ | 出金元 Asset もしくは `external` |
| to | string | ✓ | 入金先 Asset |
| amount | object | ✓ | 金額定義 |
| schedule | object | ✓ | 実行スケジュール |
| condition | object | | 実行条件 |

### amount.type

- `fixed`
- `inflation_adjusted`

### schedule.type

- `once`
- `monthly`
- `yearly`

`yearly` は `month` を必須とし、指定月に毎年実行する。

```yaml
schedule:
  type: yearly
  month: 6
```

`once` は `month` を必須とし、その月に一度だけ実行する。

```yaml
schedule:
  type: once
  month: 2026-06-01
```

`monthly` は毎月実行する。

### condition

`condition` は任意に以下を持てる。
複数指定された場合は AND で評価する。

```yaml
condition:
  state:
    employment_status: retired

  age:
    gte: 60

  value:
    target:
      type: metric
      id: cash_total
    operator: lte
    value: 3000000
```

value では `target.type` に `metric` / `asset` を許可する。
`asset` を参照する場合は対象 Asset の `market_value` を評価する。

---

## state_transitions

状態遷移ルール。

### Schema

```yaml
state_transitions:
  - id: retired_at_60
    state: retired
    condition:
      age:
        gte: 60
```

### Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | ✓ | Transition ID |
| state | string | ✓ | 遷移先 State |
| condition | object | ✓ | 遷移条件 |

- 条件を満たした場合に一度だけ state を更新する。

---

## alert_rules

Alert 判定ルール。

### Schema

```yaml
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
    message: 現金残高が不足しています
```

### Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | ✓ | Rule ID |
| target | object | ✓ | 判定対象 |
| condition | object | ✓ | 判定条件 |
| purpose | string | | 目的 |
| message | string | | 表示メッセージ |

### target

- `type` (`metric` / `asset`)
- `id`

`asset` を参照する場合は対象 Asset の `market_value` を評価する。

### condition

- `eq`
- `gte`
- `lte`

比較演算子は `condition.value.operator` に指定する。

---

## Validation Rules

- Top Level は上記5要素のみとする
- `asset_id` は一意とする
- `from` / `to` は存在する Asset を参照するか `from: external` とする
- `external` は Scenario の assets に定義しない
- `total_assets` には `external` を含めない
- `simulation_start_month` は Simulation の開始月として扱う
- `transfer_events` は YAML 定義順に評価する
- `transfer_events` は `schedule` と `condition` を満たす場合のみ実行する
- `state_transitions` は定義順に評価する