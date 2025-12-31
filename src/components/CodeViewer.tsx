"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeViewerProps {
    code: string;
    language: string;
}

export default function CodeViewer({ code, language }: CodeViewerProps) {
    const [html, setHtml] = useState("");

    useEffect(() => {
        const highlight = async () => {
            try {
                const out = await codeToHtml(code, {
                    lang: language,
                    theme: "github-dark",
                });
                setHtml(out);
            } catch (e) {
                console.error("Highlighting failed", e);
                // Fallback with basic styling
                setHtml(`<pre class="shiki github-dark" style="background-color:#0d1117;color:#c9d1d9"><code>${code}</code></pre>`);
            }
        };
        highlight();
    }, [code, language]);

    if (!html) return (
        <div className="p-4 bg-[#0d1117] h-[300px] flex items-center justify-center text-muted-foreground/30 font-mono text-sm">
            Loading highlighter...
        </div>
    );

    return (
        <div
            className="overflow-auto max-h-[800px] p-6 text-sm font-mono leading-relaxed [&_pre]:!whitespace-pre-wrap [&_pre]:!break-words [&_code]:!whitespace-pre-wrap"
            // Force background to match container to avoid glitches
            style={{ backgroundColor: '#0d1117' }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
