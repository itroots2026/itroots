"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import { ChalkboardTeacher, Video, ArrowRight } from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "./teacher-dashboard.module.css";
import Link from "next/link";

export default function TeacherDashboard() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [batches, setBatches] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "TEACHER")) {
            router.push("/lms/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (token) {
            fetch(ENDPOINTS.TEACHER.MY_BATCHES, {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setBatches(data);
                })
                .catch(console.error);
        }
    }, [token]);

    if (isLoading || !user) return null;

    return (
        <LMSShell pageTitle="Course Overview">
            <div className={styles.page}>
                <div className={styles.banner}>
                    <div>
                        <div className={styles.bannerTitle}>Course Overview</div>
                        <div className={styles.bannerSub}>Manage your assigned batches and upload course materials.</div>
                    </div>
                    <ChalkboardTeacher size={60} color="rgba(255,255,255,0.2)" weight="duotone" />
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#e0f2fe' }}><ChalkboardTeacher size={24} color="#0ea5e9" /></div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{batches.length}</span>
                            <span className={styles.statLabel}>Active Batches</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: '#fef3c7' }}><Video size={24} color="#d97706" /></div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>-</span>
                            <span className={styles.statLabel}>Total Uploads</span>
                        </div>
                    </div>
                </div>

                <div className={styles.sectionHeader}>
                    <h3>My Batches</h3>
                </div>

                <div className={styles.batchGrid}>
                    {batches.length === 0 ? (
                        <div className={styles.emptyState}>No batches assigned yet. Contact Admin for details.</div>
                    ) : (
                        batches.map(batch => (
                            <div key={batch.id} className={styles.batchCard}>
                                <div className={styles.batchHeader}>
                                    <div className={styles.batchInfo}>
                                        <h4>{batch.name}</h4>
                                        <span className={styles.courseTag}>{batch.course?.title}</span>
                                    </div>
                                    <div className={styles.scheduleBadge}>{batch.schedule}</div>
                                </div>
                                <div className={styles.batchFooter}>
                                    <Link href={`/lms/teacher/batches/${batch.id}`} className={styles.manageBtn}>
                                        Manage Batch <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </LMSShell>
    );
}
