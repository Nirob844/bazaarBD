/* eslint-disable @typescript-eslint/no-var-requires */
//! run file command: node generateFiles.js folderName fileName
const fs = require('fs');
const path = require('path');
if (process.argv.length < 3) {
  console.error(
    'Usage: node generate-folder-structure.js <FolderName> <FileName>'
  );
  process.exit(1);
}
// Get folder and file names from command-line arguments
const folderName = process.argv[2];
const fileName = process.argv[3];
const targetDirectory = path.join(
  __dirname,
  'src',
  'app',
  'modules',
  folderName
);
// Create the target directory
fs.mkdirSync(targetDirectory, { recursive: true });
// Create and write the files in the target directory
const controllerTemplate = `
`;
fs.writeFileSync(
  path.join(targetDirectory, `${fileName}.controller.ts`),
  controllerTemplate
);
const serviceTemplate = `
`;
fs.writeFileSync(
  path.join(targetDirectory, `${fileName}.service.ts`),
  serviceTemplate
);
const routesTemplate = `
`;
fs.writeFileSync(
  path.join(targetDirectory, `${fileName}.routes.ts`),
  routesTemplate
);
const interfacesTemplate = `
`;
fs.writeFileSync(
  path.join(targetDirectory, `${fileName}.interface.ts`),
  interfacesTemplate
);
const constantsTemplate = `
`;
fs.writeFileSync(
  path.join(targetDirectory, `${fileName}.constants.ts`),
  constantsTemplate
);
const validationTemplate = `
`;
fs.writeFileSync(
  path.join(targetDirectory, `${fileName}.validations.ts`),
  validationTemplate
);
console.log(
  `Folder '${folderName}' and files created successfully in 'src/app/modules'.`
);
