# ActualObservation Specification

## Purpose

ActualObservation は、実際の資産残高や取得価格などの実績値を記録する。

Scenario が将来ルールを表すのに対し、ActualObservation は現実の観測値を表す。

Simulation は Scenario に基づいて将来を予測するが、ActualObservation を反映することで、予測を実績値に合わせて補正できる。

---

## Structure

ActualObservation は以下の要素から構成される。

```text
ActualObservation
├── observed_at
└── assets
````

## observed_at

実績値を観測した年月を表す。

日付は月単位で扱い、`YYYY-MM-01` 形式とする。

例:

```yaml
observed_at: 2026-06-01
```

この値は「2026年6月の月初時点の実績値」として扱われる。

---

## assets

実績値を記録する資産一覧。

各要素は Scenario に定義された `asset_id` と対応する。

ActualObservation は全 Asset を必ず含む必要はない。記録された Asset のみを SimulationState に反映し、記録されていない Asset はシミュレーション上の値を継続する。

---

## asset observation

各 Asset の観測値は、主に以下を持つ。

* asset_id
* market_value
* cost_basis

`market_value` はその時点の評価額を表す。

`cost_basis` は取得価格を表し、譲渡益課税対象の Asset で必要となる。

---

## Overlay

ActualObservation は Simulation の月次処理の最初に反映される。

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
```

この反映処理を Overlay と呼ぶ。

---

## Rules

* `observed_at` は `YYYY-MM-01` 形式とする
* 同じ月の ActualObservation は1つだけとする
* Scenario に存在しない `asset_id` はエラーとする
* ActualObservation は Scenario に直接紐づけない
* ActualObservation は Source of Truth の一つである
* SimulationResult は保存せず、Scenario と ActualObservation から再生成する
* Simulation は `Scenario.assumptions.simulation_start_month` から開始する
* 開始月に ActualObservation が存在する場合は月初に overlay する
* Observation がない Asset は `Scenario.assets` の `market_value` / `cost_basis` を初期値として使う
* 以後、該当月の ActualObservation があれば毎月 overlay する

---

## Example

```yaml
observed_at: 2026-06-01

assets:
  - asset_id: cash
    market_value: 5000000

  - asset_id: taxable_equity
    market_value: 12000000
    cost_basis: 9000000

  - asset_id: ideco
    market_value: 3000000
```

---

## Design Principles

* ActualObservation は現実の観測値である
* 部分的な観測を許容する
* Scenario とは独立して保持する
* 月初時点の補正値として扱う
* 同じ入力から同じ SimulationResult を再生成できる
