# Metrics Reference

## Purpose

本ドキュメントは、Finances DSL が標準で提供する Built-in Metrics の計算仕様を定義する。

Metrics は SimulationState から導出される読み取り専用の値であり、永続化しない。

## Principles

- Metrics は毎月の SimulationState から計算する
- Metrics は SimulationState を変更しない
- Metrics は Graph と Alert Rule の共通入力として利用する
- 同じ SimulationState からは常に同じ Metrics を生成する

## Built-in Metrics

| Metric | 意味 |
|---|---|
| `total_assets` | 総資産 |
| `cash_total` | 現金資産合計 |
| `liquid_assets` | 流動資産合計 |
| `after_tax_liquid_assets` | 税引後流動資産 |

## Asset Classification

Metric 計算では、各 Asset の `liquidity_profile` と `tax_profile` を参照する。

### liquidity_profile

| 値 | 意味 |
|---|---|
| `cash` | 現金または現金同等資産 |
| `liquid` | 売却可能な投資資産 |
| `restricted` | 制約付き資産 |

### tax_profile

| 値 | 意味 |
|---|---|
| `none` | 課税なし |
| `tax_free` | 非課税 |
| `capital_gains` | 譲渡益課税 |
| `retirement_income` | 退職所得課税 |

## total_assets

総資産を表す。

### Definition

`external` を除く、すべての Asset の `market_value` 合計。

### Formula

```text
total_assets =
  sum(asset.market_value for all assets except external)
````

### Includes

* cash
* liquid
* restricted

## cash_total

現金資産合計を表す。

### Definition

`liquidity_profile = cash` の Asset の `market_value` 合計。

### Formula

```text
cash_total =
  sum(asset.market_value for assets where liquidity_profile = cash)
```

## liquid_assets

流動資産合計を表す。

### Definition

`liquidity_profile` が `cash` または `liquid` の Asset の `market_value` 合計。

税引前の評価額として扱う。

### Formula

```text
liquid_assets =
  sum(asset.market_value for assets where liquidity_profile in [cash, liquid])
```

### Excludes

* restricted asset

## after_tax_liquid_assets

流動資産をすべて現金化した場合の税引後価値を表す。

### Definition

`liquidity_profile` が `cash` または `liquid` の Asset を対象に、税引後価値を合計する。

### Formula

```text
after_tax_liquid_assets =
  sum(after_tax_value(asset) for assets where liquidity_profile in [cash, liquid])
```

## after_tax_value

Asset の税引後価値。

### tax_profile = none

```text
after_tax_value = market_value
```

### tax_profile = tax_free

```text
after_tax_value = market_value
```

### tax_profile = capital_gains

```text
unrealized_gain = market_value - cost_basis

taxable_gain = max(0, unrealized_gain)

tax = taxable_gain * tax_rates.capital_gains

after_tax_value = market_value - tax
```

### tax_profile = retirement_income

現時点では簡略化し、以下とする。

```text
after_tax_value = market_value
```

## Notes

* 譲渡損失がある場合、税額は負にしない
* `cost_basis` は `capital_gains` Asset の税計算に必要
* `restricted` Asset は `liquid_assets` / `after_tax_liquid_assets` には含めない
* Metrics は Alert Rule と GraphQuery から参照できる