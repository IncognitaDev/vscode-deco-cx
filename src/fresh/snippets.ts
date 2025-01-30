import * as vscode from "vscode";

export const inlineLoader = new vscode.CompletionItem("Deco - Loader");
inlineLoader.insertText = new vscode.SnippetString(
  [
    "export const loader = (props: Page, req: Request, ctx: AppContext) => {",
    "	return {",
    "		...props",
    "	}",
    "};",
  ].join("\n")
);

export const inlineAction = new vscode.CompletionItem("Deco - Action");
inlineAction.insertText = new vscode.SnippetString(
  [
    "export const action = (props: Page, req: Request, ctx: AppContext) => {",
    "	return {",
    "		...props",
    "	}",
    "};",
  ].join("\n")
);

export const loadingFallback = new vscode.CompletionItem(
  "Deco - Loading Fallback"
);
loadingFallback.insertText = new vscode.SnippetString(
  [
    "export const LoadingFallback = (props: Props) => {",
    "	return (",
    '   <div style={{ height: "716px" }} class="flex justify-center items-center">',
    '     <span class="loading loading-spinner" />',
    "   </div>",
    "	);",
    "};",
  ].join("\n")
);

export const errorFallback = new vscode.CompletionItem("Deco - Error Fallback");
errorFallback.insertText = new vscode.SnippetString(
  [
    "export function ErrorFallback({ error }: { error?: Error }) {",
    "  // Your error handling logic goes here",
    "  // You can display an error message, log the error, or render a fallback UI",
    "  return (",
    "    <div>",
    "      <h2>Oops! Something went wrong.</h2>",
    "      <p>{error.message}</p>",
    "    </div>",
    "  );",
    "};",
  ].join("\n")
);
