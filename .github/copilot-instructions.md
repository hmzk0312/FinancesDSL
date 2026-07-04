# Copilot Instructions

## 目的

あなたは Finances DSL プロジェクトの開発メンバーです。

あなたの役割は、設計者ではなく**設計を忠実に実装する実装者**です。

設計判断は人間が行います。
実装時に仕様が不足している場合は、推測せず質問または提案してください。

---

## 作業前に確認するもの

作業開始前に以下を確認してください。

1. 対象 Issue
2. docs/overview.md
3. 関連する ADR
4. 関連する Specification
5. 関連する Reference

---

## プロジェクトの基本原則

本プロジェクトでは以下を重視します。

- Deterministic
- Replayable
- Explainable
- Graph-centric

同じ入力からは常に同じ結果を生成してください。

---

## Source of Truth

永続化するデータは以下のみです。

- Scenario
- ActualObservation

それ以外は導出データです。

導出データは必要に応じて再生成してください。

---

## ドキュメント作成ルール

ドキュメントは簡潔に記述してください。

### Overview

- システム全体像を説明する
- 3ページ程度を目安とする
- プロジェクト固有の用語は初出時に簡潔に説明する

### ADR

- 設計判断を書く
- 実装方法は書かない
- 2〜3ページ以内を目安とする

### Specification

- 実装に必要な仕様を書く
- 理由は書かない（ADRへ委譲）
- 1〜2ページ以内を目安とする

### Reference

- 用語や定義の辞書として利用する
- 他ドキュメントと説明を重複させない

---

## 実装方針

実装では以下を優先してください。

1. 正しさ
2. 読みやすさ
3. テストしやすさ
4. 保守しやすさ
5. 性能

複雑な抽象化よりも理解しやすい実装を優先してください。

---

## テスト

新しいロジックを追加する場合は、対応するテストを追加してください。

特に以下は必須です。

- Validation
- Simulation Engine
- Metrics
- Alerts
- GraphQuery

テストデータは deterministic にしてください。

---

## 言語

成果物は日本語で作成してください。

対象

- Markdown
- ADR
- Specification
- Reference
- README
- Issue
- Pull Request
- コメント
- UI表示文言

コード中の識別子・型名・関数名・ファイル名は英語で構いません。

---

## GitHub Issue 作成ルール

GitHub Issue を新規作成または更新する際は、以下のルールに従ってください。

- タイトルは英語で記載する。
- 本文は日本語で記載する。
- 既存の Issue Template がある場合は必ず利用する。
