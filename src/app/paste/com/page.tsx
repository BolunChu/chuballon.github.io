"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Paste {
    id: string;
    title: string | null;
    created_at: string;
    description: string | null;
    language: string;
    author: string;
}

export default function LiteModePage() {
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicPastes = async () => {
            const { data, error } = await supabase
                .from("pastes")
                .select("id, title, created_at, description, language, author")
                .eq("is_public", true)
                .order("created_at", { ascending: false })
                .limit(50);

            if (data) setPastes(data);
            setLoading(false);
        };
        fetchPublicPastes();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Pastebin Lite</h1>
            <p className="text-sm text-gray-600">Low-bandwidth mode - Public Pastes Only</p>
            <hr style={{ margin: '20px 0' }} />

            <a href="/" style={{ marginBottom: '20px', display: 'inline-block' }}>&larr; Back to Full Site</a>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Title</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Author</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Lang</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastes.map(paste => (
                            <tr key={paste.id}>
                                <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                    <a href={`/gist?id=${paste.id}`}>{paste.title || "Untitled"}</a>
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{paste.author}</td>
                                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{paste.language}</td>
                                <td style={{ padding: '8px', border: '1px solid #ccc' }}>{new Date(paste.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
