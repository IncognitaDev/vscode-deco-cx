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


export const cache = new vscode.CompletionItem("Deco - cache");

cache.insertText = new vscode.SnippetString(
  [
    "// Cache strategy - 'stale-while-revalidate' | 'no-store' | 'no-cache'",
    "export const cache = 'stale-while-revalidate';",
    "",
    "// Define a custom cache key",
    "export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {",
    "  return `my-custom-cache-key-${props.id}`;",
    "};",
  ].join("\n")
);
