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
| Asset Snapshot     | 実際の資産残高や取得価格などを記録した月単位の実績データ              |
| Simulater          | Scenario と Actual Snapshot から将来の資産推移を月単位で計算する処理 |
| Simulation Snapshot | Simulater から計算された 月単位の データ |
| Overlay            | 複数シナリオの Simulater Snapshot を同じグラフ上に重ねて比較する表示  |

---

## 2. アーキテクチャ

### 全体フロー

```mermaid
flowchart TD
    SO("Scenario\nルールデータ")
    AS("Asset Snapshot\n実際の資産データ")
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

```mermaid
classDiagram
    Scenario --  Assumption
    Scenario o-- AssetRule
    Scenario o-- MetricRule
    Scenario o-- Action

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

### Rule

```mermaid
classDiagram
    Action <-- TransferAction
    Action <-- TransitionAction
    Action <-- AlertAction
    Action *-- Condition

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
    fromState
    toState
}

class AlertRule{
    alert
}

class State{
    stateId
    name
}

class Alert{
    alertId
    name
}
```

| 用語            | 意味                               | 例                |
| -------------- | ----------------------------------- | ---------------- |
| TransferRule   | 毎月評価される資産移動ルール          | 給与, 投資積立     |
| TransitionRule | シミュレーション状態を変更するルール   | 退職後, 年金受給   |
| AlertRule      | シミュレーション結果に対する判定ルール | 現金不足, FIRE達成 |
| Alert          | グラフ上に表示するアラート            | - |
| State          | シミュレーション状態                 | - |

---

### Condition

```mermaid
classDiagram
    Condition <-- AgeCondition
    Condition <-- DateCondition
    Condition <-- AssetCondition
    Condition <-- MetricCondition

class Condition{
    string id
    string name
}
```

| 用語            | 意味                 |
| --------------- | ------------------- |
| AgeCondition    | 年齢での判定条件      |
| DateCondition   | 期日での判定条件      |
| AssetCondition  | Asset 値での判定条件  |
| MetricCondition | Metric 値での判定条件 |

### Snapshot

Snapshot は、月のシミュレーション結果 (Simulation Snapshot) や実際の資産残高や取得価格などのAsset (Actual Snapshot)を記録する

Snapshot を構成する AssetValue, MetricValue, StateValue, AlertValue は、
各々 Asset, Metric, State, Alert のシミュレーション結果、もしくは、実際のAsset の値、及びそこから導出される Metric, State, Alert の値を保持する

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
    asset
    marketValue
    costBasis
}

class MetricValue{
    metric
}

class StateValue{
    state
}

class AlertValue{
    alert
}

```

---

### 月次処理

月々の Simulation Snapshot は以下フローに従い、再計算可能な導出データとして扱う。

```mermaid
flowchart TD;　
    BS(Simulation Snapshot\n前月の結果)
    TR[Transition Rule\n状態遷移ルールの評価]
    FK{Actual Snapshot\nは存在するか?}
    FR[Transfer Rule\n資産移動ルールの評価]
    IR[Investment Return\nAssetの更新]
    UE[Update Metrics\nMetric の更新]
    AR[Alert Rule\nAlert の表示ルールの評価]
    CS(Simulation Snapshot\n当月の結果)
    
    BS --> TR
    TR --> FK
    FK --> |No|FR
    
    FR --> IR
    IR --> UE
    UE --> AR
    AR --> CS
    CS --> |次の月へ繰り返し| BS
```

---

## 3. 設計思想

Finances DSL は、次の3つの思想を重視します。

| 原則          | 内容                                                             |
| ------------- | ---------------------------------------------------------------- |
| Deterministic | 同じ Scenario と ActualObservation からは常に同じ結果を生成する  |
| Replayable    | 任意の月の状態を再現し、なぜその結果になったかを追跡できる       |
| Graph-centric | 数値一覧よりも、複数シナリオを重ねた時系列グラフを中心に比較する |

このシステムは、将来を確率的に当てることを目的にしません。モンテカルロシミュレーションや暴落確率モデルではなく、ユーザーが定義した前提条件に基づいて、説明可能な資産推移を生成します。

---

## 4. 利用イメージ

Finances DSL は、単なるダッシュボードではなく、**シナリオを編集しながら将来を探索するワークベンチ**として使います。

```mermaid
flowchart LR
    Editor["Scenario Editor<br/>退職年齢<br/>支出<br/>利回り<br/>インフレ率<br/>積立額"]
    Graph["Overlay Graph<br/>Base<br/>Retire55<br/>Retire60<br/>Retire65"]

    Editor -->|"前提を変更"| Graph
    Graph -->|"結果を比較"| Editor
```

例えば、ユーザーは次のような比較を行えます。

- 55歳退職と60歳退職で、資産推移がどれだけ変わるか
- 利回りを低めに見積もった場合でも資産が持つか
- インフレ率を高めに設定した場合、現金がいつ不足するか
- 実績値を反映した後、以前の予測からどれだけ変化したか

このように、Finances DSL は「正解を自動で出す」ツールではなく、**複数の未来を見比べながら納得できる計画を作る**ためのツールです。
