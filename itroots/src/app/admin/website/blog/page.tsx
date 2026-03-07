"use client";

import { useEffect } from "react";
import { useLMSAuth } from "@/app/lms/auth-context";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import LMSShell from "@/components/lms/LMSShell";
import styles from "../courses/courses-manager.module.css";

export default function BlogManager() {
    const { user, isLoading } = useLMSAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== "CMS_MANAGER" && user.role !== "SUPER_ADMIN"))) {
            router.push("/login");
        }
    }, [user, isLoading, router]);


    if (isLoading || !user) return <div className={styles.container}>Loading CMS...</div>;

    return (
        <LMSShell pageTitle="Blogs">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>

                        <h1>Blogs Management</h1>
                        <p>Draft, publish, and delete blog posts for the main website.</p>
                    </div>
                    <button className={styles.actionBtnPrimary}>
                        <Plus size={20} /> Write Article
                    </button>
                </div>

                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Cover Image</th>
                                <th>Title & Category</th>
                                <th>Author & Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>API integration pending. This module is under construction.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </LMSShell>
    );
}
