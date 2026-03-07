"use client";

import { useEffect, useState } from "react";
import { useLMSAuth } from "@/app/lms/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Envelope, Phone, Briefcase, GraduationCap, User } from "@phosphor-icons/react";
import Link from "next/link";
import LMSShell from "@/components/lms/LMSShell";
import styles from "../courses/courses-manager.module.css";
import { ENDPOINTS } from "@/config/api";

export default function HireLeadsManager() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== "CMS_MANAGER" && user.role !== "SUPER_ADMIN"))) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    const fetchLeads = async () => {
        if (token) {
            try {
                const res = await fetch(ENDPOINTS.CMS.LEADS, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setLeads(data);
            } catch (err) {
                console.error("Leads fetch failed:", err);
            }
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [token]);


    if (isLoading || !user) return <div className={styles.container}>Loading CMS...</div>;

    const getIcon = (type: string) => {
        switch (type) {
            case 'hire': return <Briefcase size={20} color="#0d6efd" />;
            case 'enrollment': return <GraduationCap size={20} color="#198754" />;
            default: return <Envelope size={20} color="#6c757d" />;
        }
    };

    return (
        <LMSShell pageTitle="Form Leads">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>

                        <h1>Lead Management</h1>
                        <p>Review and act upon inquiries from corporate partners and potential students.</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Contact Info</th>
                                <th>Details</th>
                                <th>Message</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No leads found.</td></tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {getIcon(lead.type)}
                                                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{lead.type}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 700 }}>{lead.name}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{lead.email}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{lead.phone}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                {lead.company && <div><strong>Company:</strong> {lead.company}</div>}
                                                {lead.course && <div><strong>Course:</strong> {lead.course}</div>}
                                                {lead.hiringVolume && <div><strong>Volume:</strong> {lead.hiringVolume}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#444' }}>
                                                {lead.message || <em style={{ color: '#999' }}>No message</em>}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </LMSShell>
    );
}
