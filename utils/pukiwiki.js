import path from "path";
import { copyFileByLine } from "./file.js";

/**
 * pukiwikiのファイル名に変換
 * 拡張子はつかない
 * @param {string} str 例：KF
 * @returns {string} 例：4B46
 */
export const encodePukiwikiFileName = (str) =>
  encodeURIAllChar(str).replaceAll("%", "").toUpperCase();

/**
 * アルファベットなども含めてURIエンコードする
 * @param {string} str
 * @returns {string}
 */
export const encodeURIAllChar = (str) =>
  encodeURIComponent(
    str.replace(/[a-zA-Z0-9-_.!~*'()]/g, (str) =>
      str.charCodeAt(0).toString(16)
    )
  );

/**
 * pukiwiki形式でエンコードされたファイル名の文字列をデコード
 * @param {string} fileName 例：4B46
 * @returns {string} 例：KF
 */
export const decodePukiwikiFileName = (fileName) =>
  decodeURI(
    path
      .basename(fileName, path.extname(fileName))
      .split("")
      .map((str, index) => (index % 2 === 0 ? `%${str}` : str))
      .join("")
  );

/**
 * マークダウン書式をpukiwikiのマークダウン形式に変換してコピー
 * コピー先のファイルが存在していないとエラー
 * @param {string} srcFilePath
 * @param {string} pukiwikiFilePath
 * @returns {Promise<void>}
 */
export const convertToPukiwikiMd = async (srcFilePath, pukiwikiFilePath) => {
  const mdTransformerToPukiwiki = (currentLine, previousLine) => {
    const quoteRegExp = /^\&\&/;
    const listRegExp = /^[-+]/;
    const isQuotationEndLine =
      quoteRegExp.test(previousLine) && !quoteRegExp.test(currentLine);
    const isListEndLine =
      listRegExp.test(previousLine) && !listRegExp.test(currentLine);

    const formatterString = currentLine
      // BQuote && -> >
      .replace(/^\&\&/, ">")
      // Bold $text$ -> ''text''
      .replace(/\$(.*?)\$/g, "''$1''");

    const isNeedToAddNewLine =
      (isQuotationEndLine || isListEndLine) && currentLine;

    return `${isNeedToAddNewLine ? "\n" : ""}${formatterString}`;
  };

  return copyFileByLine(srcFilePath, pukiwikiFilePath, mdTransformerToPukiwiki);
};
