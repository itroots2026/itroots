"use client";

import { useEffect, useState } from "react";
import { useLMSAuth } from "@/app/lms/auth-context";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, ArrowLeft, FloppyDisk, X } from "@phosphor-icons/react";
import Link from "next/link";
import LMSShell from "@/components/lms/LMSShell";
import styles from "../courses/courses-manager.module.css";
import { ENDPOINTS } from "@/config/api";

export default function PlacementsManager() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [placements, setPlacements] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        studentName: "",
        companyName: "",
        designation: "",
        package: "",
        year: new Date().getFullYear(),
        testimonial: ""
    });

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== "CMS_MANAGER" && user.role !== "SUPER_ADMIN"))) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    const fetchPlacements = async () => {
        if (token) {
            try {
                const res = await fetch(ENDPOINTS.CMS.PLACEMENTS, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setPlacements(data);
            } catch (err) {
                console.error("Placements fetch failed:", err);
            }
        }
    };

    useEffect(() => {
        fetchPlacements();
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(ENDPOINTS.CMS.PLACEMENTS, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsEditing(false);
                setFormData({ studentName: "", companyName: "", designation: "", package: "", year: new Date().getFullYear(), testimonial: "" });
                fetchPlacements();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this placement record?")) {
            try {
                const res = await fetch(`${ENDPOINTS.CMS.PLACEMENTS}/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) fetchPlacements();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (isLoading || !user) return <div className={styles.container}>Loading CMS...</div>;

    return (
        <LMSShell pageTitle="Placements">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>

                        <h1>Placements Management</h1>
                        <p>Manage success stories, testimonials, and placement statistics.</p>
                    </div>
                    {!isEditing && (
                        <button className={styles.actionBtnPrimary} onClick={() => setIsEditing(true)}>
                            <Plus size={20} /> Add Success Story
                        </button>
                    )}
                </div>

                {isEditing && (
                    <div className={styles.card} style={{ marginBottom: '2rem' }}>
                        <form onSubmit={handleSave} className={styles.form}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Add Placement Record</h3>
                                <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Student Name</label>
                                    <input required value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Company Name</label>
                                    <input required value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Designation</label>
                                    <input required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Package (LPA)</label>
                                    <input required value={formData.package} onChange={e => setFormData({ ...formData, package: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Year</label>
                                <input type="number" required value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                            </div>
                            <button type="submit" className={styles.actionBtnPrimary}>Save Placement</button>
                        </form>
                    </div>
                )}

                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Student Details</th>
                                <th>Company</th>
                                <th>Role & Package</th>
                                <th>Year</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {placements.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No placements recorded yet.</td></tr>
                            ) : (
                                placements.map((p) => (
                                    <tr key={p.id}>
                                        <td><strong>{p.studentName}</strong></td>
                                        <td>{p.companyName}</td>
                                        <td>{p.designation} ({p.package})</td>
                                        <td>{p.year}</td>
                                        <td>
                                            <button onClick={() => handleDelete(p.id)} className={styles.iconBtn} style={{ color: '#dc3545' }}><Trash size={18} /></button>
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
