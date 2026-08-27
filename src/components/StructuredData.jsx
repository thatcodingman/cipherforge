import { useEffect } from "react";

/**
 * Injects a JSON-LD <script> tag into <head> for the current page.
 * Removes it on unmount so tags don't stack up when navigating
 * between tools via react-router.
 *
 * Usage:
 *   <StructuredData data={someSchemaObject} />
 */
export default function StructuredData({ data }) {
  useEffect(() => {
    if (!data) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-structured-data", "true");
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}
