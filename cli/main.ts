import path from "path";
import fs from "node:fs";
import prompts from "prompts";
import colors from "picocolors";
import minimist from "minimist";

const {
  cyanBright,
  greenBright,
  red,
  reset,
  yellowBright,
} = colors;

type Configs = {
  library?: "next" | "react";
  component?: "tailwind" | "chakra" | "mantine";
  state?: "context" | "redux" | "jotai";
  api?: "fetch" | "rtk" | "tanstack";
}
type ColorFunc = (str: string | number) => string;
type LibraryVariant = {
  name: string;
  displayName: string;
  color: ColorFunc;
}
type ComponentVariant = {
  name: string;
  displayName: string;
  color: ColorFunc;
}
type StateVariant = {
  name: string;
  displayName: string;
  color: ColorFunc;
}
type ApiVariant = {
  name: string;
  displayName: string;
  color: ColorFunc;
}

const libraries: LibraryVariant[] = [
  {
    name: "react",
    displayName: "React",
    color: cyanBright,
  },
  {
    name: "next",
    displayName: "Next.js",
    color: yellowBright,
  }
];
const components: ComponentVariant[] = [
  {
    name: "tailwind",
    displayName: "Tailwind",
    color: cyanBright,
  },
  {
    name: "chakra",
    displayName: "Chakra UI",
    color: greenBright,
  },
  {
    name: "mantine",
    displayName: "Mantine",
    color: yellowBright,
  }
];
const states: StateVariant[] = [
  {
    name: "context",
    displayName: "Context API",
    color: cyanBright,
  },
  {
    name: "redux",
    displayName: "Redux",
    color: greenBright,
  },
  {
    name: "jotai",
    displayName: "Jotai",
    color: yellowBright,
  }
];
const apis: ApiVariant[] = [
  {
    name: "fetch",
    displayName: "Fetch",
    color: cyanBright,
  },
  {
    name: "rtk",
    displayName: "Redux Toolkit",
    color: greenBright,
  },
  {
    name: "tanstack",
    displayName: "Tanstack",
    color: yellowBright,
  },
];

// Agruments parsed with minimist
const args = minimist<Configs>(process.argv.slice(2), {
  default: { help: false },
  alias: { h: 'help', l: 'library', c: 'component', s: 'state', a: 'api' },
  string: ['_'],
});
const cwd = process.cwd();

const LIBRARIES = [
  "next",
  "react",
];
const COMPONENTS = [
  "chakra",
  "mantine",
  "tailwind",
];
const STATES = [
  "context",
  "jotai",
  "redux",
];
const APIS = [
  "fetch",
  "rtk",
  "tanstack",
];

const defaultTargetDir = 'thanka-ui-starter-project';
const renameFiles: Record<string, string> = {
  '_gitignore': '.gitignore',
}

export const main = async () => {
  const argTargetDir = args._[0];
  const argLibrary = args.library || args.l;
  const argComponent = args.component || args.c;
  const argState = args.state || args.s;
  const argApi = args.api || args.a;

  let targetDir = argTargetDir || defaultTargetDir;

  let result: prompts.Answers<'projectName' | 'library' | 'component' | 'state' | 'api'>;
  try {
    result = await prompts([
      {
        type: argTargetDir ? null : 'text',
        name: 'projectName',
        message: reset('Project Name:'),
        initial: defaultTargetDir,
        onState: (state) => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir;
        }
      },
      {
        type:
          argLibrary && LIBRARIES.includes(argLibrary) ? null : 'select',
        name: 'library',
        message:
          typeof argLibrary === 'string' && !LIBRARIES.includes(argLibrary)
            ? reset(
              `"${argLibrary}" isn't available. Please choose from below: `,
            )
            : reset('Select a library:'),
        initial: 0,
        choices: libraries.map((library) => {
          const libraryColor = library.color
          return {
            title: libraryColor(library.displayName || library.name),
            value: library.name,
          }
        }),
      },
      {
        type:
          argComponent && COMPONENTS.includes(argComponent) ? null : 'select',
        name: 'component',
        message:
          typeof argComponent === 'string' && !COMPONENTS.includes(argComponent)
            ? reset(
              `"${argComponent}" isn't available. Please choose from below: `,
            )
            : reset('Select a component style:'),
        initial: 0,
        choices: components.map((component) => {
          const componentColor = component.color
          return {
            title: componentColor(component.displayName || component.name),
            value: component.name,
          }
        }),
      },
      {
        type:
          argState && STATES.includes(argState) ? null : 'select',
        name: 'state',
        message:
          typeof argState === 'string' && !STATES.includes(argState)
            ? reset(
              `"${argState}" isn't available. Please choose from below: `,
            )
            : reset('Select a state preference:'),
        initial: 0,
        choices: states.map((state) => {
          const stateColor = state.color
          return {
            title: stateColor(state.displayName || state.name),
            value: state.name,
          }
        }),
      },
      {
        type:
          argApi && APIS.includes(argApi) ? null : 'select',
        name: 'api',
        message:
          typeof argApi === 'string' && !APIS.includes(argApi)
            ? reset(
              `"${argApi}" isn't available. Please choose from below: `,
            )
            : reset('Select a API style:'),
        initial: 0,
        choices: apis.map((api) => {
          const apiColor = api.color
          return {
            title: apiColor(api.displayName || api.name),
            value: api.name,
          }
        }),
      },
    ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        }
      },
    );
  } catch (error: unknown) {
    console.error(red((error as Error).message));
    return;
  }

  // get the prompts result
  const { projectName, library, component, state, api } = result;

  const templateRootLibrary = library || argLibrary;
  const templateComponentVariant = component || argComponent;
  const templateStateVariant = state || argState;
  const templateApiVariant = api || argApi;

  const templateVariant = `${templateComponentVariant}-${templateStateVariant}-${templateApiVariant}`;

  console.log('Project Name: ', projectName);
  console.log('Target Directory: ', targetDir);
  console.log('To use template folder: ', templateVariant);

  const root = path.join(cwd, "__tests__"); // TODO: FOR TESTING __TESTS__
  // const root = path.join(cwd, targetDir);

  const pkgInfo = pkgInfoFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : 'pnpm';
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.');

  // TODO: Custom command
  console.log(`\n${cyanBright('✨  Creating project in')} ${cyanBright(root)}`);

  const templateDir = path.resolve(__dirname, `../../templates/${templateRootLibrary}`, templateVariant);

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  }

  const filesToCopy = fs.readdirSync(templateDir);
  for (const file of filesToCopy.filter((f) => f !== 'package.json')) {
    write(file);
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'));
  pkg.name = projectName || "tests"; // TODO: check for valid project name
  // pkg.name = projectName || targetDir;

  write('package.json', JSON.stringify(pkg, null, 2) + '\n');

  const cdProjectRelativePath = path.relative(cwd, root);
  console.log(`\n${cyanBright('🎉  Successfully created project')} Get started by running:`);

  if (cdProjectRelativePath) {
    console.log(` cd ${cdProjectRelativePath.includes(' ') ? `"${cdProjectRelativePath}"` : cdProjectRelativePath}`);
  }

  switch (pkgManager) {
    case 'yarn':
      console.log(`   yarn`)
      console.log(`   yarn dev`)
      break;
    default:
      console.log(`   ${pkgManager} install`)
      console.log(`   ${pkgManager} run dev`)
      break;
  }

  console.log()
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

function pkgInfoFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

main();
