"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import { Megaphone, Warning, Info, PushPin } from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "./announcements.module.css";

type Priority = "URGENT" | "HIGH" | "NORMAL" | "LOW";

export default function StudentAnnouncementsPage() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "STUDENT")) {
            router.push("/lms/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!token) return;
        fetch(ENDPOINTS.STUDENT.ANNOUNCEMENTS, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) setAnnouncements(data.data);
                setLoadingData(false);
            })
            .catch(err => {
                console.error("Failed to fetch announcements:", err);
                setLoadingData(false);
            });
    }, [token]);

    if (isLoading || !user) return null;

    const rest = announcements.filter(a => a.priority !== "URGENT");

    const priorityColor = (p: Priority) => {
        if (p === "URGENT") return "#ef4444";
        if (p === "HIGH") return "#f59e0b";
        if (p === "NORMAL") return "#0881ec";
        return "#6b7280";
    };

    const priorityBg = (p: Priority) => {
        if (p === "URGENT") return "#fee2e2";
        if (p === "HIGH") return "#fef3c7";
        if (p === "NORMAL") return "#eff6ff";
        return "#f3f4f6";
    };

    const getIcon = (p: Priority) => {
        if (p === "URGENT") return <Warning size={22} weight="fill" />;
        if (p === "HIGH") return <PushPin size={22} weight="fill" />;
        return <Megaphone size={22} weight="fill" />;
    };

    return (
        <LMSShell pageTitle="Notifications">
            <div className={styles.page}>
                {/* Banner */}
                <div className={styles.banner}>
                    <div>
                        <div className={styles.bannerTitle}>Notifications</div>
                        <div className={styles.bannerSub}>
                            Important updates from your teachers and administration.
                        </div>
                    </div>
                    <Megaphone size={60} color="rgba(255,255,255,0.2)" weight="duotone" />
                </div>

                {/* Content */}
                {loadingData ? (
                    <div className={styles.list}>
                        {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                    </div>
                ) : announcements.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Megaphone size={52} color="#94a3b8" weight="duotone" />
                        <h3>No Notifications</h3>
                        <p>You have no notifications at this time.</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {announcements.map(item => (
                            <AnnouncementCard key={item.id} item={item} />
                        ))}
                        {rest.map(item => (
                            <AnnouncementCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </LMSShell>
    );
}

function AnnouncementCard({ item, pinned = false }: { item: any; pinned?: boolean }) {
    const priorityColor = (p: Priority) => {
        if (p === "URGENT") return "#ef4444";
        if (p === "HIGH") return "#f59e0b";
        if (p === "NORMAL") return "#0881ec";
        return "#6b7280";
    };

    const priorityBg = (p: Priority) => {
        if (p === "URGENT") return "#fee2e2";
        if (p === "HIGH") return "#fef3c7";
        if (p === "NORMAL") return "#eff6ff";
        return "#f3f4f6";
    };

    const getIcon = (p: Priority) => {
        if (p === "URGENT") return <Warning size={22} weight="fill" />;
        if (p === "HIGH") return <PushPin size={22} weight="fill" />;
        return <Megaphone size={22} weight="fill" />;
    };

    const color = priorityColor(item.priority as Priority);
    const bg = priorityBg(item.priority as Priority);

    return (
        <div className={`${styles.card} ${pinned ? styles.cardPinned : ""}`} style={{ borderLeftColor: color }}>
            <div className={styles.iconWrapper} style={{ background: bg, color }}>
                {getIcon(item.priority as Priority)}
            </div>
            <div className={styles.content}>
                <div className={styles.meta}>
                    <span className={styles.badge} style={{ background: bg, color }}>{item.priority}</span>
                    {item.batchId ? (
                        <span className={styles.batchBadge}>Batch: {item.batch?.name}</span>
                    ) : (
                        <span className={styles.globalBadge}>Global Notice</span>
                    )}
                    <span className={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                        })}
                    </span>
                </div>
                <h3 className={styles.title}>{item.title}</h3>
                <div className={styles.body}>{item.content}</div>
                <div className={styles.footer}>
                    <div className={styles.avatar}>
                        {item.author?.name ? item.author.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span>
                        Posted by <strong>{item.author?.name || "Admin"}</strong>
                    </span>
                    <span className={styles.role}>
                        · {item.author?.role?.replace("_", " ").toLowerCase() || "admin"}
                    </span>
                </div>
            </div>
        </div>
    );
}
