"use client";

import { useEffect, useState } from "react";

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
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPublicPastes = async () => {
            try {
                const { data, error } = await supabase
                    .from("pastes")
                    .select("id, title, created_at, description, language, author")
                    .eq("is_public", true)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;
                if (data) setPastes(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load");
            } finally {
                setLoading(false);
            }
        };
        fetchPublicPastes();
    }, []);

    const safeDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch (e) {
            return dateStr;
        }
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Pastebin Lite</h1>
            <p style={{ fontSize: '12px', color: '#666' }}>Legacy Mode (iOS 12+)</p>
            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ccc' }} />

            <a href="/" style={{ marginBottom: '20px', display: 'inline-block', textDecoration: 'none', color: '#0366d6' }}>&larr; Back to Full Site</a>

            {loading ? (
                <p>Loading data...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Title</th>
                                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Lang</th>
                                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastes.map(paste => (
                                <tr key={paste.id}>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                        <a href={`/gist?id=${paste.id}`} style={{ color: '#0366d6', textDecoration: 'none' }}>
                                            {paste.title || "Untitled"}
                                        </a>
                                        <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>By {paste.author}</div>
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{paste.language}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{safeDate(paste.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
