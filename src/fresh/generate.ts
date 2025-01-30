// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import * as vscode from "vscode";

const extensionMap = {
  loaders: ".ts",
  actions: ".ts",
  sections: ".tsx",
  islands: ".tsx",
  components: ".tsx",
};

async function writeFile(newFile: string, body: string) {
  // check if file exists
  let fileExists;
  try {
    fileExists = await vscode.workspace.fs.stat(vscode.Uri.file(newFile));
  } catch (_error) {
    // do nothing
  }
  if (fileExists) {
    vscode.window.showErrorMessage("File already exists");
    throw new Error("File already exists");
  }

  vscode.workspace.fs.writeFile(
    vscode.Uri.file(newFile),
    new Uint8Array(Buffer.from(body))
  );

  vscode.window.showInformationMessage("File Created");
}

function kebabToCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function snakeToCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelizeWhatever(str: string) {
  return capitalizeFirstLetter(snakeToCamelCase(kebabToCamelCase(str)));
}

interface Route {
  label: string;
  body: string;
}

const routes: Route[] = [
  {
    label: "Simple JSX Page",
    body: `// Document https://fresh.deno.dev/docs/getting-started/create-a-route

export default function __FILENAME__() {
  return (
    <main>
      <h1>__FILENAME__</h1>
      <p>This is the about page.</p>
    </main>
  );
}`,
  },
  {
    label: "Dynamic route",
    body: `// Document https://fresh.deno.dev/docs/getting-started/dynamic-routes

import { PageProps } from "$fresh/server.ts";

export default function __FILENAME__(props: PageProps) {
  const { name } = props.params;
  return (
    <main>
      <p>Greetings to you, {name}!</p>
    </main>
  );
}`,
  },
  {
    label: "Handler route",
    body: `// Document https://fresh.deno.dev/docs/concepts/routes#handler-route

import { FreshContext, Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req: Request, _ctx: FreshContext) {
    return new Response("Hello World");
  },
};`,
  },
];

const asyncRoutes: Route[] = [
  {
    label: "Async component route with defineHelper (Recommended)",
    body: `// Document https://fresh.deno.dev/docs/concepts/routes#define-helper

import { defineRoute } from "$fresh/server.ts";

export default defineRoute(async (req, ctx) => {
  // const data = await loadData();
  const data = { name: "World" };

  return (
    <div class="page">
      <h1>Hello {data.name}</h1>
    </div>
  );
});`,
  },
  {
    label: "Mixed handler and component route",
    body: `// Document https://fresh.deno.dev/docs/concepts/routes#mixed-handler-and-component-route

import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  foo: number;
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    // const value = await loadFooValue();
    return ctx.render({ foo: 1 });
  },
};

export default function __FILENAME__(props: PageProps<Data>) {
  return <p>foo is: {props.data.foo}</p>;
}`,
  },
  {
    label: "Async route component",
    body: `// Document https://fresh.deno.dev/docs/concepts/routes#async-route-components

import { RouteContext } from "$fresh/server.ts";
  
  export default async function __FILENAME__(req: Request, ctx: RouteContext) {
  // const value = await loadFooValue();
  return <p>foo is: {1}</p>;
}`,
  },
];

function addExtensionIfMissing(fileName: string, extension: string) {
  if (fileName.endsWith(extension)) {
    return fileName;
  }
  return fileName + extension;
}

const getFolderUri = (folderName: string): vscode.Uri | undefined => {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("No workspace is opened");
    return undefined;
  }

  const basePath = vscode.workspace.workspaceFolders[0].uri;
  return vscode.Uri.joinPath(basePath, folderName);
};

async function generateFile(
  uri: vscode.Uri,
  body: string,
  folderName: keyof typeof extensionMap
) {
  const extension = extensionMap[folderName];
  const defaultFileName = `index${extension}`;
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("No workspace is opened");
    return;
  }

  const folderUri = uri ?? getFolderUri(folderName);

  if (!folderUri) {
    vscode.window.showErrorMessage(
      "Please left click on a folder in the explorer and try again from context menu"
    );
    return;
  }

  const fileName = await vscode.window.showInputBox({
    prompt: "Enter file name",
    placeHolder: defaultFileName,
    value: defaultFileName,
  });

  if (!fileName) {
    return;
  }

  const newFile =
    folderUri.fsPath + "/" + addExtensionIfMissing(fileName, extension);

  const onlyFileName = fileName.split("/").at(-1)!;

  const nameForClass = camelizeWhatever(onlyFileName.split(".")[0]);
  body = body.replace(/__FILENAME__/g, nameForClass);

  try {
    await writeFile(newFile, body);
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
  }
}

export async function generateComponent(uri: vscode.Uri) {
  const body = `import { JSX } from "preact";

export function __FILENAME__(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <h1>__FILENAME__</h1>
    </div>
  );
}`;

  await generateFile(uri, body, "components");
}

export async function generateIsland(uri: vscode.Uri) {
  const body = `// Document https://docs.deco.cx/en/performance/islands#islands

import { useSignal } from "@preact/signals";

export default function __FILENAME__() {
  const count = useSignal(0);

  return (
    <div>
      <button onClick={() => count.value -= 1}>-1</button>
      <p>{count}</p>
      <button onClick={() => count.value += 1}>+1</button>
    </div>
  );
}`;

  await generateFile(uri, body, "islands");
}

export async function generateLoader(uri: vscode.Uri) {
  const body = `// Document https://docs.deco.cx/en/concepts/loader#loader
  import { AppContext } from "site/apps/site.ts";

export interface Props {
  
}

const loader = async (props: Props,req: Request, ctx: AppContext): Promise<unknown | null> => {
  return null;
};

// https://docs.deco.cx/pt/developing-capabilities/manage-block-access
export const defaultVisibility =  'public'

export default loader;
`;

  await generateFile(uri, body, "loaders");
}

export async function generateAction(uri: vscode.Uri) {
  const body = `// Document https://docs.deco.cx/en/concepts/action#action
import { AppContext } from "site/apps/site.ts";

export interface Props {
  
}

const action = async (props: Props,req: Request, ctx: AppContext): Promise<unknown | null> => {
  return null;
};

// https://docs.deco.cx/pt/developing-capabilities/manage-block-access
export const defaultVisibility =  'public'

export default action;
`;

  await generateFile(uri, body, "actions");
}

export async function generateSection(uri: vscode.Uri) {
  const body = `// Document https://docs.deco.cx/en/cms-capabilities/content/sections#sections

export default function __FILENAME__() {

  return (
    <div>
      <h2>__FILENAME__</h2>
    </div>
  );
}

export function LoadingFallback() {
  return (
    <div style={{ height: "716px" }} class="flex justify-center items-center">
      <span class="loading loading-spinner" />
    </div>
  );
}
`;

  await generateFile(uri, body, "sections");
}

export async function exportAsIsland(uri: vscode.Uri) {
  const body = `// Document https://docs.deco.cx/en/performance/islands#islands

import Component from "./__FILENAME__";
import type { Props } from "./__FILENAME__";

function Island(props: Props) {
  return <Component {...props} />;
}

export default Island;
`;

  await generateFile(uri, body, "islands");
}

export async function exportAsSection(uri: vscode.Uri) {
  const body = `// Document https://docs.deco.cx/en/cms-capabilities/content/sections#sections
export { default } from "./__FILENAME__";

export function LoadingFallback() {
  return (
    <div style={{ height: "716px" }} class="flex justify-center items-center">
      <span class="loading loading-spinner" />
    </div>
  );
}
`;

  await generateFile(uri, body, "sections");
}
