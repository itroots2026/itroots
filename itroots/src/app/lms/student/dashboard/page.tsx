"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import { ENDPOINTS } from "@/config/api";
import styles from "./dashboard.module.css";
import {
    GraduationCap,
    CalendarCheck,
    ClipboardText,
    Trophy,
    ArrowRight,
    BookOpen,
    Megaphone,
    Warning,
} from "@phosphor-icons/react";

export default function StudentDashboard() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();

    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
    const [loadingEnroll, setLoadingEnroll] = useState(true);
    const [loadingAnn, setLoadingAnn] = useState(true);
    const [loadingAtt, setLoadingAtt] = useState(true);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "STUDENT")) {
            router.push("/lms/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!token) return;

        fetch(ENDPOINTS.STUDENT.MY_LEARNING, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setEnrollments(d); })
            .catch(console.error)
            .finally(() => setLoadingEnroll(false));

        fetch(ENDPOINTS.STUDENT.ANNOUNCEMENTS, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setAnnouncements(d.data); })
            .catch(console.error)
            .finally(() => setLoadingAnn(false));

        fetch(ENDPOINTS.STUDENT.ATTENDANCE, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setAttendanceData(d.data); })
            .catch(console.error)
            .finally(() => setLoadingAtt(false));
    }, [token]);

    if (isLoading || !user) return null;

    const firstName = user.name?.split(" ")[0] || "Student";

    // Compute attendance % across all batches
    const attBatches = Object.values(attendanceData);
    const avgAtt = attBatches.length
        ? Math.round(attBatches.reduce((s: number, b: any) => s + (b.total > 0 ? (b.present / b.total) * 100 : 0), 0) / attBatches.length)
        : null;

    const priorityColor = (p: string) => {
        if (p === "URGENT") return "#ef4444";
        if (p === "HIGH") return "#f59e0b";
        return "#0881ec";
    };

    const priorityIcon = (p: string) => {
        if (p === "URGENT" || p === "HIGH") return <Warning size={16} weight="fill" />;
        return <Megaphone size={16} weight="fill" />;
    };

    return (
        <LMSShell pageTitle="Dashboard">
            <div className={styles.page}>
                {/* ── Banner ── */}
                <div className={styles.banner}>
                    <div>
                        <div className={styles.bannerTitle}>Dashboard</div>
                        <div className={styles.bannerSub}>Track your progress, attendance, and upcoming classes.</div>
                    </div>
                    <GraduationCap size={60} color="rgba(255,255,255,0.2)" weight="duotone" />
                </div>

                {/* ── Stat Cards ── */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                            <GraduationCap size={22} weight="duotone" />
                        </div>
                        <div className={styles.statInfo}>
                            <div className={styles.statValue}>{loadingEnroll ? "—" : enrollments.length}</div>
                            <div className={styles.statLabel}>Enrolled Batches</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <CalendarCheck size={22} weight="duotone" />
                        </div>
                        <div className={styles.statInfo}>
                            <div className={styles.statValue}>{loadingAtt ? "—" : avgAtt !== null ? `${avgAtt}%` : "N/A"}</div>
                            <div className={styles.statLabel}>Attendance</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
                            <ClipboardText size={22} weight="duotone" />
                        </div>
                        <div className={styles.statInfo}>
                            <div className={styles.statValue}>—</div>
                            <div className={styles.statLabel}>Assignments Due</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                            <Trophy size={22} weight="duotone" />
                        </div>
                        <div className={styles.statInfo}>
                            <div className={styles.statValue}>—</div>
                            <div className={styles.statLabel}>Quiz Score</div>
                        </div>
                    </div>
                </div>

                {/* ── Two Column: Continue Learning + Announcements ── */}
                <div className={styles.twoCol}>
                    {/* Continue Learning */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>Continue Learning</span>
                            <Link href="/my-learning" className={styles.viewAll}>View All <ArrowRight size={14} /></Link>
                        </div>

                        {loadingEnroll ? (
                            <div className={styles.skeletonList}>
                                {[1, 2].map(i => <div key={i} className={styles.skeleton} />)}
                            </div>
                        ) : enrollments.length === 0 ? (
                            <div className={styles.emptyState}>
                                <BookOpen size={40} color="#cbd5e1" weight="duotone" />
                                <p>No batches enrolled yet.</p>
                            </div>
                        ) : (
                            <div className={styles.batchList}>
                                {enrollments.slice(0, 4).map((item: any) => (
                                    <Link
                                        key={item.id}
                                        href={`/learning/${item.batch?.id}`}
                                        className={styles.batchCard}
                                    >
                                        <div className={styles.batchAvatar}>
                                            {item.batch?.course?.title?.charAt(0) || "B"}
                                        </div>
                                        <div className={styles.batchInfo}>
                                            <div className={styles.batchName}>{item.batch?.name || "Batch"}</div>
                                            <div className={styles.batchCourse}>{item.batch?.course?.title}</div>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ width: `${item.progressPercent || 0}%` }} />
                                            </div>
                                        </div>
                                        <ArrowRight size={18} color="#0881ec" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Announcements */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>Notifications</span>
                        </div>

                        {loadingAnn ? (
                            <div className={styles.skeletonList}>
                                {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Megaphone size={40} color="#cbd5e1" weight="duotone" />
                                <p>No announcements yet.</p>
                            </div>
                        ) : (
                            <div className={styles.annList}>
                                {announcements.slice(0, 5).map((ann: any) => (
                                    <div key={ann.id} className={styles.annCard}>
                                        <div className={styles.annIcon} style={{ color: '#0881ec' }}>
                                            <Megaphone size={16} weight="fill" />
                                        </div>
                                        <div className={styles.annContent}>
                                            <div className={styles.annTitle}>{ann.title}</div>
                                            <div className={styles.annBody}>{ann.content}</div>
                                            <div className={styles.annMeta}>
                                                {new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                {" · "}{ann.author?.name || "Admin"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LMSShell>
    );
}
