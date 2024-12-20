// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import * as vscode from "vscode";
import * as snippets from "./snippets";
import { join } from "path";
import {
  generateAction,
  generateComponent,
  generateIsland,
  generateLoader,
  generateSection,
} from "./generate";
import { FreshRouteViewProvider } from "./webview";
import { existsSync, readFileSync } from "fs";

const getRootPath = () => vscode.workspace?.workspaceFolders?.[0]?.uri?.fsPath;

async function isFreshProject() {
  const workspace = getRootPath();
  if (!workspace) {
    return false;
  }
  const freshGenPath = join(workspace, "fresh.gen.ts");
  let fileExists = null;
  try {
    fileExists = await vscode.workspace.fs.stat(vscode.Uri.file(freshGenPath));
  } catch (_error) {
    // do nothing
  }
  return !!fileExists;
}

const createCompletionItem = (
  label: string,
  documentation: string,
  context: vscode.ExtensionContext,
  prefix?: string
) => {
  const item = new vscode.CompletionItem(
    `${label}`,
    vscode.CompletionItemKind.Keyword
  );
  item.insertText = new vscode.SnippetString(label);

  const imageUri = vscode.Uri.joinPath(
    context.extensionUri,
    "src",
    "assets",
    "previews",
    `${prefix ? prefix + "-" : ""}${label.replace("@", "")}.png`
  );
  const markdownDoc = new vscode.MarkdownString();
  markdownDoc.supportHtml = true;
  markdownDoc.appendMarkdown(`${documentation}\n\n`);
  if (existsSync(imageUri?.fsPath)) {
    markdownDoc.appendMarkdown(`<img src="${imageUri}" alt="${label} preview" width="100%" />`);
  }

  item.documentation = markdownDoc;
  item.sortText = "0" + label;
  item.detail = "Deco";

  return item;
};

function getCommentRange(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | null {
  const text = document.getText();
  const offset = document.offsetAt(position);

  const startIndex = text.lastIndexOf("/**", offset);

  if (startIndex === -1) {
    return null;
  }

  const endIndex = text.indexOf("*/", startIndex);

  if (endIndex === -1) {
    return null;
  }

  return new vscode.Range(
    document.positionAt(startIndex),
    document.positionAt(endIndex + 2)
  );
}

export function activate(context: vscode.ExtensionContext) {
  isFreshProject().then((isFresh) => {
    vscode.commands.executeCommand("setContext", "is-fresh-project", isFresh);
  });

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "incognita.deco.generateComponent",
      generateComponent
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "incognita.deco.generateIsland",
      generateIsland
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "incognita.deco.generateAction",
      generateAction
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "incognita.deco.generateLoader",
      generateLoader
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "incognita.deco.generateSection",
      generateSection
    )
  );


  const provider = vscode.languages.registerCompletionItemProvider(
    "typescriptreact",
    {
      provideCompletionItems(
        _document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
      ) {
        return [
          snippets.inlineLoader,
          snippets.loadingFallback,
          snippets.errorFallback,
        ];
      },
    }
  );

  context.subscriptions.push(provider);

  const annotationCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      ["typescript", "typescriptreact"],
      {
        provideCompletionItems(
          document: vscode.TextDocument,
          position: vscode.Position
        ) {
          const commentRange = getCommentRange(document, position);

          if (!commentRange) {
            return [];
          }

          const line = document.lineAt(position).text;
          if(/@(format|options)/.test(line)) {
            return [];
          }
          

          const completions: vscode.CompletionItem[] = [
            createCompletionItem(
              "title",
              "Receives text that will be used as the title of the label for that input in the form.\n\nUsage: `@title Number of products`",
              context
            ),
            createCompletionItem(
              "description",
              "Receives text that will be used as the description in the label for that input in the form.\n\nUsage: `@description Total number of products to display in the storefront`",
              context
            ),
            createCompletionItem(
              "hide",
              "Hides this property in the Admin form. The value still remains in the JSON of the Section.\n\nUsage: `@hide`",
              context
            ),
            createCompletionItem(
              "format",
              "Configures a field to be formatted differently. This can cause its Widget to change.\n\nUsage: `@format [Format value]`",
              context
            ),
            createCompletionItem(
              "ignore",
              "The value and the property are completely ignored.\n\nUsage: `@ignore`",
              context
            ),
            createCompletionItem(
              "maximum",
              "Configures a maximum value for that field. Works on properties of type `number`. (value <= X)\n\nUsage: `@maximum 10`",
              context
            ),
            createCompletionItem(
              "minimum",
              "Configures a minimum value for that field. Works on properties of type `number`. (value >= X)\n\nUsage: `@minimum 15`",
              context
            ),
            createCompletionItem(
              "exclusiveMaximum",
              "Configures a maximum value for that field. Works on properties of type `number`. It is the exclusive counterpart of `@maximum`. (value < X)\n\nUsage: `@exclusiveMaximum 10`",
              context
            ),
            createCompletionItem(
              "exclusiveMinimum",
              "Configures a minimum value for that field. Works on properties of type `number`. It is the exclusive counterpart of `@minimum`. (value > X)\n\nUsage: `@exclusiveMinimum 15`",
              context
            ),
            createCompletionItem(
              "maxLength",
              "Configures a maximum length for the text of a field. Works on properties of type `string`.\n\nUsage: `@maxLength 30`",
              context
            ),
            createCompletionItem(
              "minLength",
              "Configures a minimum length for the text of a field. Works on properties of type `string`.\n\nUsage: `@minLength 8`",
              context
            ),
            createCompletionItem(
              "readOnly",
              "Makes a field uneditable in the ad`in form but still readable.\n\nUsage: `@readOnly`",
              context
            ),
            createCompletionItem(
              "uniqueItems",
              "Ensures that fields of type `array` cannot have duplicate values.\n\nUsage: `@uniqueItems true`",
              context
            ),
            createCompletionItem(
              "maxItems",
              "Ensures that fields of type `array` cannot have more than X values.\n\nUsage: `@maxItems 3`",
              context
            ),
            createCompletionItem(
              "minItems",
              "Ensures that fields of type `array` cannot have fewer than X values.\n\nUsage: `@minItems 2`",
              context
            ),
            createCompletionItem(
              "default",
              "Configures a default value for that field.\n\nUsage: `@default Testing`",
              context
            ),
            createCompletionItem(
              "deprecated",
              "Marks a field as deprecated.\n\nUsage: `@deprecated We will remove this field in the next update`",
              context
            ),
            createCompletionItem(
              "options",
              "Required for the operation of dynamic options, button group and icon select widgets.\n\nUsage: `@options deco-sites/mystore/loaders/products.ts`",
              context
            ),
            createCompletionItem(
              "language",
              "Required for the Widget `@format code`, used to define the language on editor.\n\nUsage: `@language javascript`",
              context
            ),
          ];

          return completions;
        },
      },
      "@"
    );

  const formatAnnotationCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      ["typescript", "typescriptreact"],
      {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
          const line = document.lineAt(position).text;
          console.log(line);
          if(!line.includes("@format")) {
            return [];
          }

          return [
            createCompletionItem(
              "color",
              "Renders a color input instead of a text input.",
              context,
              "format"
            ),
            createCompletionItem(
              "date",
              "Renders a date input instead of a text input.",
              context,
              "format"
            ),
            createCompletionItem(
              "datetime",
              "Renders a datetime input instead of a text input.",
              context,
              "format"
            ),
            createCompletionItem(
              "html",
              "Renders an input that opens a WYSIWYG editor for advanced HTML text editing.",
              context,
              "format"
            ),
            createCompletionItem(
              "rich-text",
              "Renders an input that opens a WYSIWYG editor for advanced Markdown text editing.",
              context,
              "format"
            ),
            createCompletionItem(
              "icon-select",
              "The Icon Select widget enables you to create a select input for icons, where each option consists of both an icon and its label. This allows users to preview and choose the right icon easily. All icons rendered in the widget must be defined explicitly as SVG strings",
              context,
              "format"
            ),
            createCompletionItem(
              "button-group",
              "The Button Group widget allows you to render select options in an icon format, providing a visually appealing way to choose options. Each option is represented by an icon, offering flexibility and customization for your application.",
              context,
              "format"
            ),
          ];
        },
      }
    );

  const optionsCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      ["typescript", "typescriptreact"],
      {
        async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
          const line = document.lineAt(position).text;
          if(!line.includes("@options")) {
            return [];
          }

          const loaders = await getLoaders();
          return loaders.map((loader) => createCompletionItem(loader, loader, context, "options"));
        },
      }
    );

  context.subscriptions.push(annotationCompletionProvider);
  context.subscriptions.push(formatAnnotationCompletionProvider);
  context.subscriptions.push(optionsCompletionProvider);

}


const getLoaders = async () => {
  const workspace = getRootPath();
  if (!workspace) {
    return [];
  }
  const manifestPath = join(workspace,"manifest.gen.ts");
  const manifest = readFileSync(manifestPath, "utf-8");

  try {
    const loadersMatch = manifest.match(/\"loaders\":\s*{([^}]*)}/);

    if (!loadersMatch || !loadersMatch[1]) {
      return [];
    }

    const loaderKeysRegex = /"([^"]+)":/mg;
    const loaderKeys: string[] = [];

    const a = loadersMatch[1].matchAll(loaderKeysRegex);

    for (const match of a) {
      loaderKeys.push(match[1]);
    }

    return loaderKeys;
  } catch (error) {
    console.error("Error parsing manifest:", error);
    return [];
  }
};