import { finished } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";

import encoding from "encoding-japanese";
import iconv from "iconv-lite";

/**
 * 指定された文字コードでファイルをコピーする。
 * 指定できるファイルコードは、iconv-liteが対応してるもの。
 * コピー先のファイルは存在してないとだめ
 * @param {string} targetFilePath
 * @param {string} srcCharCode
 * @param {string} distPath
 */
export const encodeToUTF8 = (targetFilePath, srcCharCode, distPath) => {
  return createReadStream(targetFilePath)
    .pipe(iconv.decodeStream(srcCharCode))
    .pipe(iconv.encodeStream("utf8"))
    .pipe(createWriteStream(distPath));
};

/**
 * encoding-japaneseパッケージによってファイル内の文字コードを判断
 * @param {string} filePath
 */
export const judgeCharCode = async (filePath) => {
  const readStream = createReadStream(filePath);
  const buffer = [];
  readStream.on("data", (chunk) => {
    buffer.push(...chunk);
  });
  await finished(readStream);
  const charCode = encoding.detect(buffer);
  return charCode;
};

/**
 * 変換可能ならUTF8にしてコピー。
 * UNICODEと判定される場合は、そのままコピー。
 * 無理な場合は、コピーしない。
 * コピー先のファイルが存在していないとエラー。
 * @param {string} srcFilePath
 * @param {string} newFilePath
 */
export const copyFileContentByUTF8 = async (srcFilePath, newFilePath) => {
  const charCode = await judgeCharCode(srcFilePath);
  switch (charCode) {
    case "UTF8": {
      return finished(
        createReadStream(srcFilePath).pipe(createWriteStream(newFilePath))
      );
    }
    case "SJIS": {
      return finished(encodeToUTF8(srcFilePath, "Shift_JIS", newFilePath));
    }
    case "UTF16": {
      return finished(encodeToUTF8(srcFilePath, "utf16", newFilePath));
    }
    case "UTF32": {
      return finished(encodeToUTF8(srcFilePath, "utf32", newFilePath));
    }
    case "ASCII": {
      return finished(encodeToUTF8(srcFilePath, "ascii", newFilePath));
    }
    case "EUCJP": {
      return finished(encodeToUTF8(srcFilePath, "EUC-JP", newFilePath));
    }
    case "UNICODE": {
      consola.warn(
        `${srcFilePath} is encoded by ${charCode}\n${charCode} may not cause any ploblems, but the code is not supported`
      );
      return finished(
        createReadStream(srcFilePath).pipe(createWriteStream(newFilePath))
      );
    }
    default:
      consola.error(
        `${srcFilePath} is encoded by ${charCode}\n${charCode} is not supported`
      );
      break;
  }
};
