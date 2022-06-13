# file-converter
ファイル名とファイルの中身を変換します。フォルダ構造を保ったまま、あるいは特定のルールにしたがって再配置しながら、大量のテキストファイルを一括変換可能です。

# 想定している使用目的
markdownで書いていた文書群を他のシステムに移行するときに発生する、フォルダ構造の変換やマークダウン記法の変換への対応

# 機能
テキストファイルを、階層構造を保ったままファイルに変えてくれます。その際に
- 文字コードをUTF8に統一（現在対応している変換元は、SJIS,UTF16,UTF32,ASCII,EUCJP）
- マークダウン記法を一行単位で正規表現を使って変換。一行前の状態も参照可能
- Streamingを使った省メモリの実装

# 処理の流れ
フォルダ構造の把握 → 文字コードの統一 → マークダウンの変換とファイル名の変換、フォルダ構造の再配置
# pukiwiki
`./utils/pukiwiki.js`にpukiwiki関係の関数がまとまっています。このファイルを真似てファイル名変換器やマークダウン変換器を作り、`./main.js`で読み込めば、他の書式にも対応できます

## 使い方
`./content`の中に指定のテキストファイルを入れます。
```
$ ls content/
folder1 folder2
```
その中身で
```
$ ls content/folder1/
sub-folder1  sub-folder2  sub-folder3
```
その中身は、
```
$ ls content/folder1/sub-folder1/
filename1.txt filename2.txt
```
みたいな感じにします。拡張子が`.txt`じゃないものは無視されます。

そして、
```
npm run convert
```
を実行すると、`./wiki`の中にpukiwikiのファイル名に変換されたテキストファイルが生成されます。
pukiwikiファイルのファイル名は、`./content`のフォルダ構造が反映されます。


## 目次ファイルの生成
```
npm run convert:index
```
pukiwikiのtreemenu pluginでは、フォルダと同名のファイルを作ると、indexファイルとして機能します。このindexファイルが存在しないと、表示崩れが発生するため、それを生成するためのコマンドです。
`npm run convert`は一度`./wiki`の中身を削除するので、`npm run convert`を実行したら再度`npm run convert:index`を実行してください。
