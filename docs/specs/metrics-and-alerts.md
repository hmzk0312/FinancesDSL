# Metrics and Alerts Specification

## Purpose

Metrics は SimulationState から導出される集計値である。

Alerts は Metrics や Asset の状態を評価し、SimulationResult に意味のあるイベントを付与する。

どちらも導出データであり、SimulationState を変更しない。

---

## Metrics

Metric は SimulationState から計算される読み取り専用の値である。

Graph や Alert は Metric を参照して評価を行う。

```text
SimulationState
        │
        ▼
    Metrics
        │
        ├── Graph
        └── Alerts
```

---

## Built-in Metrics

標準で提供する Metric は以下とする。

| Key | Description |
|------|-------------|
| total_assets | 総資産 |
| cash_total | 現金資産合計 |
| liquid_assets | 流動資産合計 |
| after_tax_liquid_assets | 税引後流動資産 |

詳細な計算方法は Metrics Reference に定義する。

---

## Custom Metrics

将来的にユーザー定義 Metric を追加できる設計とする。

ただし、本仕様では Built-in Metrics のみを対象とする。

---

## Alerts

Alert は SimulationState を評価した結果である。

Alert は Simulation を停止せず、SimulationResult に記録される。

```text
SimulationState
        │
        ▼
     Metrics
        │
        ▼
   Alert Rules
        │
        ▼
      Alerts
```

---

## Alert Rule

Alert Rule は以下から構成される。

- target
- condition
- severity
- message

target は以下を参照できる。

- Metric
- Asset

---

## Built-in Alerts

代表例

- 現金不足
- 資産枯渇
- FIRE 達成

詳細な定義は Alert Rule に委譲する。

---

## Evaluation

Alert は毎月、Metrics 計算後に評価する。

同じ月に複数の Alert が発生してもよい。

Alert 同士に優先順位は持たない。

---

## Rules

- Metrics は SimulationState を変更しない
- Alerts は SimulationState を変更しない
- Metrics は毎月再計算する
- Alerts は毎月再評価する
- Alert は Simulation を停止しない

---

## Design Principles

- Metrics は Graph・Alert の共通入力とする
- Alert は状態ではなくイベントとして扱う
- Built-in Metrics を基本とし、将来の拡張を妨げない