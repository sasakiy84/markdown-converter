import { mkdir, writeFile } from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";
import path from "path";

/**
 * mkdir -p と同じ。
 * 途中のフォルダが存在していなくても作ってくれる
 * @param {string} filePath
 * @param {string} data ファイルに書き込むデータ
 */
export const createFileRecursively = async (filePath, data = "") => {
  try {
    await writeFile(filePath, data);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      const dir = path.dirname(filePath);
      try {
        await mkdir(dir, { recursive: true });
        await writeFile(filePath, data);
      } catch (err) {
        if (err) throw err;
      }
    }
  }
};

/**
 * ファイルを一行ずつ処理する。その際にtransformerを指定すればテキストを置換等ができる
 * @param {string} srcFilePath
 * @param {string} newFilePath
 * @param {inputLineTransformer} inputLineTransformer
 * @returns {Promise<void>}
 * @example
 * const addDAZETransformer = (inputLine, _previousLine) => `${inputLine}DAZE（｀ω´）`
 * await copyFileByLine("path/src.txt", "path/new.txt", addDAZETransformer)
 */
export const copyFileByLine = async (
  srcFilePath,
  newFilePath,
  inputLineTransformer = (inputLine) => inputLine
) => {
  const readStream = createReadStream(srcFilePath);
  const writeStream = createWriteStream(newFilePath);
  const readLine = createInterface({
    input: readStream,
    output: writeStream,
  });

  let previousLine = "";
  readLine.on("line", (lineString) => {
    const transformedInputLine = inputLineTransformer(lineString, previousLine);
    writeStream.write(`${transformedInputLine}\n`);

    previousLine = lineString;
  });

  return new Promise((resolve) => {
    readLine.on("close", () => resolve());
  });
};

/**
 * @callback inputLineTransformer
 * @param {string} currentLine
 * @param {string} previousLine 一行前の文字列
 * @returns {string}
 */
