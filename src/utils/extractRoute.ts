export type RouteQuery = { from: string; to: string };

export function extractRoute(message: string): RouteQuery | null {
  const match = message.match(
    /(?:(?:från|ifrån)\s+)?([A-Za-zÅÄÖåäö\-]+)\s+till\s+([A-Za-zÅÄÖåäö\-]+)/i
  );
  if (!match) return null;
  return { from: match[1].trim(), to: match[2].trim() };
}
