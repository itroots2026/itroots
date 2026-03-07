"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import { Calendar, X, Plus, Trash } from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "../dashboard/admin-dashboard.module.css";

export default function AdminBatchesPage() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [batches, setBatches] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newBatch, setNewBatch] = useState({
        name: "",
        courseId: "",
        teacherId: "",
        schedule: "",
        startDate: "",
        endDate: ""
    });

    const fetchData = useCallback(async () => {
        if (!token) return;
        try {
            const [bRes, cRes, uRes] = await Promise.all([
                fetch(ENDPOINTS.ADMIN.BATCHES, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(ENDPOINTS.CMS.COURSES, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(ENDPOINTS.ADMIN.USERS, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const [bData, cData, uData] = await Promise.all([bRes.json(), cRes.json(), uRes.json()]);
            setBatches(bData);
            setCourses(cData);
            setTeachers(uData.filter((u: any) => u.role === "TEACHER" || u.role === "teacher"));

            if (cData.length > 0 && !newBatch.courseId) {
                setNewBatch(prev => ({ ...prev, courseId: cData[0].id }));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, [token, newBatch.courseId]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "SUPER_ADMIN")) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading || !user) return null;

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(ENDPOINTS.ADMIN.BATCHES, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newBatch)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewBatch({
                    name: "",
                    courseId: courses[0]?.id || "",
                    teacherId: teachers[0]?.id || "",
                    schedule: "",
                    startDate: "",
                    endDate: ""
                });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this batch?")) {
            try {
                await fetch(`${ENDPOINTS.ADMIN.BATCHES}/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <LMSShell pageTitle="Batch Schedule">
            <div className={styles.welcome} style={{ marginBottom: '2rem' }}>
                <div>
                    <h2>Batch Schedule</h2>
                    <p>Manage session schedules, instructor assignments, and cohort timelines.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '0.75rem 1.5rem', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}>
                    <Plus size={16} weight="bold" /> Create New Batch
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {batches.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '20px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                        No batches created yet. Click "Create New Batch" to get started.
                    </div>
                ) : (
                    batches.map((batch) => (
                        <div key={batch.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0881ec', background: 'rgba(8,129,236,0.1)', padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase' }}>{batch.course?.title || "Unknown Course"}</span>
                                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#0a0f1e', marginTop: '0.5rem' }}>{batch.name}</h3>
                                </div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    <Calendar size={24} color="#0881ec" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', minWidth: '60px' }}>Teacher:</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{batch.teacher?.name || "Unassigned"}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', minWidth: '60px' }}>Schedule:</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{batch.schedule}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', minWidth: '60px' }}>Duration:</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{batch.startDate} to {batch.endDate}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                                <button onClick={() => handleDelete(batch.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Trash size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Batch Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={24} weight="bold" />
                        </button>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#0a0f1e' }}>Create New Batch</h3>

                        <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Batch Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBatch.name}
                                    onChange={e => setNewBatch({ ...newBatch, name: e.target.value })}
                                    placeholder="e.g. Full Stack JS Evening"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Select Course</label>
                                <select
                                    required
                                    value={newBatch.courseId}
                                    onChange={e => setNewBatch({ ...newBatch, courseId: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                >
                                    <option value="" disabled>Select a course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Assign Teacher</label>
                                <select
                                    required
                                    value={newBatch.teacherId}
                                    onChange={e => setNewBatch({ ...newBatch, teacherId: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                >
                                    <option value="" disabled>Select a teacher</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Schedule Timing</label>
                                <input
                                    type="text"
                                    required
                                    value={newBatch.schedule}
                                    onChange={e => setNewBatch({ ...newBatch, schedule: e.target.value })}
                                    placeholder="Mon, Wed, Fri — 10:00 AM"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newBatch.startDate}
                                        onChange={e => setNewBatch({ ...newBatch, startDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newBatch.endDate}
                                        onChange={e => setNewBatch({ ...newBatch, endDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ marginTop: '1rem', padding: '0.9rem', background: '#0a0f1e', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                                Add Batch
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </LMSShell>
    );
}
