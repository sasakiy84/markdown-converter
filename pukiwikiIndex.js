import { ORIGIN_FOLDER_PATH, PUKIWIKI_FOLDER_PATH } from "./constats.js";
import { readdir } from "fs/promises";
import path from "path";
import { createFileRecursively } from "./utils/file.js";
import { encodePukiwikiFileName } from "./utils/pukiwiki.js";
import consola from "consola";

// pukiwikiにおける、それぞれのフォルダのトップページを作る

consola.start("starting to create file indexes");
const yearFolderNames = await readdir(ORIGIN_FOLDER_PATH);
const yearFolderIndexes = yearFolderNames.map((yearFolderName) => [
  `${encodePukiwikiFileName(yearFolderName)}.txt`,
  yearFolderName,
]);

const nestedRollFolderIndexes = await Promise.all(
  yearFolderNames.map(async (yearFolderName) => {
    const yearFolderPath = path.join(ORIGIN_FOLDER_PATH, yearFolderName);
    const rollFolderNames = await readdir(yearFolderPath);
    return rollFolderNames.map((rollFolderName) => {
      const pukiwkiFileName = encodePukiwikiFileName(
        `${yearFolderName}/${rollFolderName}`
      );
      const fileContentTitle = `${yearFolderName}| ${rollFolderName}`;
      return [`${pukiwkiFileName}.txt`, fileContentTitle];
    });
  })
);
const rollFolderIndexes = nestedRollFolderIndexes.flat();

const allFileIndexes = [...yearFolderIndexes, ...rollFolderIndexes];

consola.start("starting to create index files");

await Promise.all(
  allFileIndexes.map(async (fileIndex) => {
    const [filePath, fileContentTitle] = fileIndex;
    const fileContent = `*${fileContentTitle}\n\n#ls`;
    const newFilePath = path.join(PUKIWIKI_FOLDER_PATH, filePath);
    return createFileRecursively(newFilePath, fileContent);
  })
);
