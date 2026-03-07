"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import {
    Users,
    ChalkboardTeacher,
    Calendar,
    CreditCard,
    ArrowRight
} from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "./admin-dashboard.module.css";

export default function AdminDashboard() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalBatches: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "SUPER_ADMIN")) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        const fetchStats = async () => {
            if (token) {
                try {
                    const res = await fetch(ENDPOINTS.ADMIN.STATS, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.stats) {
                        setStats({
                            ...data.stats,
                            totalRevenue: data.stats.totalStudents * 24999 // Mock internal calc
                        });
                    }
                } catch (err) {
                    console.error("Stats fetch failed:", err);
                }
            }
        };
        fetchStats();
    }, [token]);

    if (isLoading || !user) return null;

    return (
        <LMSShell pageTitle="Admin System Intelligence">
            <div className={styles.welcome}>
                <div>
                    <h2>Admin Dashboard</h2>
                    <p>Monitoring global system health, financial growth, and enrollment conversions.</p>
                </div>
            </div>

            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <span className={styles.statValue} style={{ color: '#10b981' }}>₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Registered Students</span>
                    <span className={styles.statValue}>{stats.totalStudents}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Batches</span>
                    <span className={styles.statValue}>{stats.totalBatches}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Expert Instructors</span>
                    <span className={styles.statValue}>{stats.totalTeachers}</span>
                </div>
            </section>

            <div className={styles.mainGrid}>
                {/* Critical Controls */}
                <div className={styles.section} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.sectionHeader}>Operational Control Hub</div>
                    <div className={styles.controlsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', padding: '1.5rem' }}>
                        <Link href="/students" className={styles.controlCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', background: '#f8fafc', borderRadius: '16px', textDecoration: 'none', transition: 'transform 0.2s' }}>
                            <Users size={48} color="#0881ec" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Student Records</span>
                        </Link>
                        <Link href="/teachers" className={styles.controlCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', background: '#f8fafc', borderRadius: '16px', textDecoration: 'none' }}>
                            <ChalkboardTeacher size={48} color="#0881ec" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Faculty Management</span>
                        </Link>
                        <Link href="/batches" className={styles.controlCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', background: '#f8fafc', borderRadius: '16px', textDecoration: 'none' }}>
                            <Calendar size={48} color="#0881ec" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Batch Scheduling</span>
                        </Link>
                        <Link href="/payments" className={styles.controlCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', background: '#f8fafc', borderRadius: '16px', textDecoration: 'none' }}>
                            <CreditCard size={48} color="#0881ec" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Finances & Fees</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Platform Settings CTA */}
            <div className={styles.ctaSection}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Manage Portal Global Settings</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Update course pricing, broadcast announcements, or reset system parameters.</p>
                </div>
                <Link href="/settings" style={{ background: '#0881ec', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Open System Config <ArrowRight size={18} />
                </Link>
            </div>
        </LMSShell>
    );
}
