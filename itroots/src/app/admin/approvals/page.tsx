"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import {
    CheckCircle,
    XCircle,
    Warning
} from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "../dashboard/admin-dashboard.module.css";

// Interface map from the backend response
export interface PendingUser {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminApprovalsPage() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");


    useEffect(() => {
        if (!isLoading && (!user || user.role !== "SUPER_ADMIN")) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    const fetchPendingUsers = async () => {
        setLoadingData(true);
        try {
            const res = await fetch(ENDPOINTS.ADMIN.USERS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                // Filter users who are not active
                const pending = data.filter((u: PendingUser) => !u.isActive);
                setPendingUsers(pending);
            } else {
                setErrorMsg(data.message || "Failed to load pending users");
            }
        } catch (error) {
            setErrorMsg("Connection error while fetching data");
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user && user.role === "SUPER_ADMIN") {
            fetchPendingUsers();
        }
    }, [user, token]);

    const handleApprove = async (userId: string) => {
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: true })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("User approved successfully!");
                setPendingUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                setErrorMsg(data.message || "Failed to approve user");
            }
        } catch (error) {
            setErrorMsg("Network error during approval");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to reject and delete this registration?")) return;
        // Mock rejection (ideally we have a DELETE /users/:id endpoint, but for now just remove from UI to simulate rejection until backend has delete API)
        setSuccessMsg("User application rejected.");
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
    };

    if (isLoading || !user) return null;

    return (
        <LMSShell pageTitle="Pending Approvals">
            <div className={styles.welcome} style={{ marginBottom: '2rem' }}>
                <h2>Pending Approvals</h2>
                <p>Review and verify students or teachers waiting to access the platform.</p>
            </div>

            {errorMsg && (
                <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                    <Warning size={18} /> {errorMsg}
                </div>
            )}
            {successMsg && (
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #34d399' }}>
                    {successMsg}
                </div>
            )}

            <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>USER DETAILS</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>ROLE</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>REGISTERED DATE</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingData ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading pending users...</td>
                            </tr>
                        ) : pendingUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No pending approvals at this time.</td>
                            </tr>
                        ) : (
                            pendingUsers.map((u) => {
                                const initial = u.name.charAt(0).toUpperCase();
                                const d = new Date(u.createdAt);
                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ee9602, #f5a623)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{initial}</div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0a0f1e' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{
                                                background: u.role === 'TEACHER' ? '#e0e7ff' : '#f1f5f9',
                                                color: u.role === 'TEACHER' ? '#3730a3' : '#475569',
                                                fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '100px'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                            {isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleApprove(u.id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                                    <CheckCircle size={16} weight="bold" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                                                    <XCircle size={16} weight="bold" /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </LMSShell>
    );
}
