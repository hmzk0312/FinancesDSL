# Finances DSL

長期資産形成・退職計画を支援するシミュレーションアプリケーション

---

## 1. システム概要

Finances DSL は、長期資産形成・退職計画を支援するためのシミュレーションアプリケーションである

ユーザーは退職年齢、支出、運用利回り、インフレ率などの前提条件を変更しながら、複数の将来シナリオを同じグラフ上で比較できる。実績データを取り込むことで予測を最新の状態へ更新し、長期的な資産計画を継続的に見直せる。

このシステムで扱う中心概念は次の5つ。

| 用語      | 意味                                                       |
| ------------------ | --------------------------------------------------------- |
| Scenario           | 収入・支出・投資・退職などのルールを定義したデータ             |
| Actual Snapshot     | 実際の資産残高や取得価格などを記録した月単位の実績データ              |
| Simulater          | Scenario と Actual Snapshot から将来の資産推移を月単位で計算する処理 |
| Simulation Snapshot | Simulater から計算された月単位のデータ |
| Overlay            | 複数シナリオの Simulater Snapshot を同じグラフ上に重ねて比較する表示  |

---

## 2. アーキテクチャ

### 全体フロー

```mermaid
flowchart TD
    SO("Scenario\nルールデータ")
    AS("Actual Snapshot\n実際の資産データ")
    SM["Simulater"]
    SS["Simulation Snapshot\nシミュレーション結果"]
    OG("Overlay")

    SO --> SM
    AS --> SM
    SM --> SS
    SS --> OG
```

システムが永続化するデータは **Scenario** と **Actual Snapshot** のみ

**Actual Snapshot** と **Simulation Snapshot** は共に **Snapshot** 型で表現される

---

### Scenario

Scenario は将来の資産推移をシミュレーションするためのルールを定義する。

Scenario はシミュレーション開始前に確定し、シミュレーション中に変更されない Immutable なデータとして扱う。

Assumption, AssetRule, MetricRule, Action はユニークな ID を持つ

```mermaid
classDiagram
    Scenario --  Assumption
    Scenario o-- AssetRule
    Scenario o-- MetricRule
    Scenario o-- Action
    AssetRule -- AssetValue
    MetricRule -- MetricValue

class Scenario{
    scenarioId
    name
    assumption
    assetRules[]
    metricRules[]
}

class Assumption{
    assumptionId
    name
}

class AssetRule{
    assetId
    name
}

class MetricRule{
    metricId
    name
}

```

| 用語       | 意味                                 | 例                   |
| ---------- | ----------------------------------- | -------------------- |
| Assumption | Scenario の前提条件                  | 生年月日, インフレ率   |
| AssetRule  | Scenario で取り扱う資産の評価ルール   | 現金, 投資信託        |
| MetricRule | Metric の算出ルール                  | 総資産, 税引後流動資産 |
| Action     | 毎月のシミュレーション結果に対して評価・実行する振る舞い(後述) | - |

---

### Action

```mermaid
classDiagram
    Action <-- TransferAction
    Action <-- TransitionAction
    Action <-- AlertAction
    Action *-- Condition
    TransferAction -- AssetValue
    TransitionAction -- StateValue
    AlertAction -- AlertValue

class Action{
    actionId
    name
    conditions[][]
}

class TransferAction{
    fromAssetId
    toAssetId
}

class TransitionAction{
    fromStateId
    toStateId
}

class AlertAction{
    alertId
}
```

| 用語             | 意味                               | 例                |
| ---------------- | ----------------------------------- | ---------------- |
| TransferAction   | 毎月評価される資産移動アクション          | 給与, 投資積立     |
| TransitionAction | シミュレーション状態を変更するアクション   | 退職後, 年金受給   |
| AlertAction      | シミュレーション結果に対する判定アクション | 現金不足, FIRE達成 |
---

### Condition

```mermaid
classDiagram
    Condition <-- AgeCondition
    Condition <-- DateCondition
    Condition <-- AssetCondition
    Condition <-- MetricCondition

class Condition{
    id
    name
}
```

| 用語            | 意味                 |
| --------------- | ------------------- |
| AgeCondition    | 年齢での判定条件      |
| DateCondition   | 期日での判定条件      |
| AssetCondition  | Asset 値での判定条件  |
| MetricCondition | Metric 値での判定条件 |

### Snapshot

Snapshot は、月のシミュレーション結果 (Simulation Snapshot) や実際の資産残高や取得価格などの Asset (Actual Snapshot) を記録する

```mermaid
classDiagram
    Snapshot *-- AssetValue
    Snapshot *-- MetricValue
    Snapshot *-- StateValue
    Snapshot *-- AlertValue

class Snapshot{
    datetime
    assetValue[]
    metricValue[]
    stateValue[]
    alertValue[]
}

class AssetValue{
    assetId
}

class MetricValue{
    metricId
}

class StateValue{
    stateId
}

class AlertValue{
    alertId
}

```

---

### 月次処理

月々の Simulation Snapshot は以下フローに従い、再計算可能な導出データとして扱う。

```mermaid
flowchart TD;　
    BS(Simulation Snapshot\n前月の結果)
    TR[Transition Action\n状態遷移の評価]
    FK{Actual Snapshot\nは存在するか?}
    FR[Transfer Action\n資産移動ルールの評価]
    IR[Asset Rule\nAssetの更新]
    AA[Actual Snapshot\nの適用]
    UE[Metric Rule\nMetric の更新]
    AR[Alert Action\nAlert の表示ルールの評価]
    CS(Simulation Snapshot\n当月の結果)
    
    BS --> TR
    TR --> FK
    FK --> |No|FR
    FK --> |Yes|AA
    FR --> IR
    IR --> UE
    AA --> UE
    UE --> AR
    AR --> CS
    CS --> |次の月へ繰り返し| BS
```

