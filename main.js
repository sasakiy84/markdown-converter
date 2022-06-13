import path from "path";
import { readdir, mkdir, rm } from "fs/promises";
import consola from "consola";

import {
  ORIGIN_FOLDER_PATH,
  UTF8_FOLDER_PATH,
  PUKIWIKI_FOLDER_PATH,
} from "./constats.js";
import {
  convertToPukiwikiMd,
  encodePukiwikiFileName,
} from "./utils/pukiwiki.js";
import { createFileRecursively } from "./utils/file.js";
import { copyFileContentByUTF8 } from "./utils/charCode.js";

const start = performance.now();

await Promise.all([
  rm(UTF8_FOLDER_PATH, { recursive: true, force: true }),
  rm(PUKIWIKI_FOLDER_PATH, { recursive: true, force: true }),
]);
await Promise.all([mkdir(UTF8_FOLDER_PATH), mkdir(PUKIWIKI_FOLDER_PATH)]);

// file pathとpukiwikiの名前の対応表を作ります。
// [filePath, pukiwiki][]みたいな感じになります。
consola.start("starting to create file indexes");

const yearIndexes = await readdir(ORIGIN_FOLDER_PATH);
const nestedFileIndexes = await Promise.all(
  yearIndexes.map(async (yearFolderName) => {
    const yearFolderPath = path.join(ORIGIN_FOLDER_PATH, yearFolderName);
    const rollIndexesPerYear = await readdir(yearFolderPath);

    const getFileIndexesPromises = rollIndexesPerYear.map(
      async (rollFolderName) => {
        const rollFolderPath = path.join(yearFolderPath, rollFolderName);
        const textFileNameIndexes = await readdir(rollFolderPath);

        const textFileNameIndexesWithPukiwikiFileName = textFileNameIndexes
          .filter((fileName) => path.extname(fileName) === ".txt")
          .map((textFileName) => {
            const fileBaseName = path.basename(textFileName, ".txt");
            const pukiwikiFileName = encodePukiwikiFileName(
              `${yearFolderName}/${rollFolderName}/${fileBaseName}`
            );
            const filePartialPath = path.join(
              yearFolderName,
              rollFolderName,
              textFileName
            );

            return [filePartialPath, pukiwikiFileName];
          });
        return textFileNameIndexesWithPukiwikiFileName;
      }
    );

    return Promise.all(getFileIndexesPromises);
  })
);
const fileIndexes = nestedFileIndexes.flat().flat();

// 文字コードがUTF8以外のものを変換して,UTF8のフォルダにコピーします
consola.start("starting to convert to utf8");

await Promise.all(
  fileIndexes.map(async (fileIndex) => {
    const src = path.join(ORIGIN_FOLDER_PATH, fileIndex[0]);
    const newFilePath = path.join(UTF8_FOLDER_PATH, fileIndex[0]);
    await createFileRecursively(newFilePath);
    return copyFileContentByUTF8(src, newFilePath);
  })
);

// wikiフォルダにファイルを生成して、テキストをpukiwikiのマークダウンに変換してコピー
consola.start("starting to convert to pukiwiki files");

await Promise.all(
  fileIndexes.map(async (fileIndex) => {
    const UTF8TextFilePath = path.join(UTF8_FOLDER_PATH, fileIndex[0]);
    const pukiwikiFileName = fileIndex[1];
    const pukiwkiFilePath = path.join(
      PUKIWIKI_FOLDER_PATH,
      `${pukiwikiFileName}.txt`
    );

    await createFileRecursively(pukiwkiFilePath);

    return convertToPukiwikiMd(UTF8TextFilePath, pukiwkiFilePath);
  })
);

const end = performance.now();
consola.info(`main.js executed in ${end - start}ms`);
