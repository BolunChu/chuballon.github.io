import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useUIStore } from "@/store/uiStore";
import NormalDashboard from "@/components/normal/NormalDashboard";
import EndfieldDashboard from "@/components/endfield/EndfieldDashboard";

interface Paste {
    id: string;
    title: string | null;
    created_at: string;
    language: string;
    is_public: boolean;
    author: string;
    mime_type?: string;
    storage_path?: string;
}

export default function Home() {
    const { user, loading: authLoading, credentials } = useAuth();
    const { isTestMode } = useUIStore();
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPastes = async () => {
            setLoading(true);
            try {
                if (user && credentials) {
                    const { data, error } = await supabase.rpc('api_get_my_pastes', {
                        p_username: credentials.username,
                        p_hash: credentials.hash
                    });
                    if (error) throw error;
                    if (data) setPastes(data);
                } else {
                    const { data, error } = await supabase
                        .from("pastes")
                        .select("*")
                        .eq("is_public", true)
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    if (data) setPastes(data);
                }
            } catch (err) {
                console.error("Failed to fetch pastes:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchPastes();
        }
    }, [user, credentials, authLoading]);

    if (isTestMode) {
        return <EndfieldDashboard user={user} pastes={pastes} loading={loading} />;
    }

    return <NormalDashboard user={user} pastes={pastes} loading={loading} />;
}
