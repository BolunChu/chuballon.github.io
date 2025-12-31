import { supabase } from "@/lib/supabase";

export const uploadFile = async (
    file: File,
    user: { username: string },
    credentials: { username: string; hash: string }
) => {
    // Check file type for "Smart Upload"
    // Valid text types we want to read directly
    const textTypes = [
        'text/', 'application/json', 'application/javascript', 'application/x-javascript',
        'application/xml', 'text/markdown', 'text/x-markdown'
    ];
    // Check extension
    const name = file.name.toLowerCase();
    const isCode = name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.json') || name.endsWith('.py') || name.endsWith('.sql');

    const shouldReadContent = file.type.startsWith('text/') || textTypes.some(t => file.type.includes(t)) || isCode;

    let content = "";
    let storagePath = null;
    let mimeType = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'text';

    if (shouldReadContent) {
        // Read file content
        content = await file.text();
        mimeType = 'text/plain'; // Or specific type
    } else {
        // Binary Upload
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const path = `${user.username}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(path, file);

        if (uploadError) {
            console.error("Storage Error:", uploadError);
            throw new Error(`Storage Upload Failed: ${uploadError.message}`);
        }

        storagePath = path;
    }

    // Create DB Record
    const { data: newId, error: rpcError } = await supabase.rpc('api_create_paste', {
        p_username: credentials.username,
        p_hash: credentials.hash,
        p_content: content,
        p_language: ext,
        p_title: file.name,
        p_description: shouldReadContent ? 'Imported Text File' : 'Uploaded Binary File',
        p_is_public: true,
        p_mime_type: contentTypeToMime(ext, file.type),
        p_storage_path: storagePath
    });

    if (rpcError) {
        console.error("DB Error:", rpcError);
        throw new Error(`Database Insert Failed: ${rpcError.message}`);
    }

    return newId;
};

// Helper to normalize mime types
function contentTypeToMime(ext: string, originalType: string) {
    if (ext === 'md') return 'text/markdown';
    if (ext === 'html') return 'text/html';
    if (ext === 'pdf') return 'application/pdf';
    return originalType || 'application/octet-stream';
}
