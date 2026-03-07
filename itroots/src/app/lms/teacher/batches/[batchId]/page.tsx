"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import {
    Video,
    ClipboardText,
    Exam,
    Plus,
    X,
    ChartBar,
    ArrowLeft,
    MonitorPlay,
    BookOpenText,
    Megaphone,
    CalendarCheck
} from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "./batch-management.module.css";

export default function BatchManagementPage() {
    const { batchId } = useParams();
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();

    const [data, setData] = useState<any>({ contents: [], tests: [], enrollments: [] });
    const [isAddContentModal, setIsAddContentModal] = useState(false);
    const [isCreateTestModal, setIsCreateTestModal] = useState(false);
    const [isAnnouncementModal, setIsAnnouncementModal] = useState(false);
    const [isAttendanceModal, setIsAttendanceModal] = useState(false);

    // Forms
    const [contentForm, setContentForm] = useState({ title: "", description: "", type: "VIDEO", contentUrl: "" });
    const [testForm, setTestForm] = useState({ title: "", description: "", totalMarks: 100, durationMinutes: 60, questions: [] });
    const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", priority: "NORMAL" });
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({}); // studentId -> status

    const fetchBatchData = useCallback(async () => {
        if (!token || !batchId) return;
        try {
            const res = await fetch(`${ENDPOINTS.TEACHER.BATCH_DATA}/${batchId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const json = await res.json();
            setData(json);

            // Initialize attendance states
            if (json.data?.enrollments) {
                const initRecs: any = {};
                json.data.enrollments.forEach((e: any) => {
                    initRecs[e.student.id] = 'PRESENT';
                });
                setAttendanceRecords(initRecs);
            }
        } catch (err) {
            console.error(err);
        }
    }, [token, batchId]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "TEACHER")) {
            router.push("/lms/login");
        }
    }, [user, isLoading, router]);


    useEffect(() => {
        fetchBatchData();
    }, [fetchBatchData]);

    const handleAddContent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(ENDPOINTS.TEACHER.ADD_CONTENT, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ ...contentForm, batchId })
            });
            if (res.ok) {
                setIsAddContentModal(false);
                fetchBatchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(ENDPOINTS.TEACHER.CREATE_TEST, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ ...testForm, batchId })
            });
            if (res.ok) {
                setIsCreateTestModal(false);
                fetchBatchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(ENDPOINTS.TEACHER.BASE + '/announcements', {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ ...announcementForm, batchId })
            });
            if (res.ok) {
                setIsAnnouncementModal(false);
                setAnnouncementForm({ title: "", content: "", priority: "NORMAL" });
                alert("Announcement posted.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const recordsArray = Object.keys(attendanceRecords).map(studentId => ({
                studentId,
                status: attendanceRecords[studentId]
            }));

            const res = await fetch(ENDPOINTS.TEACHER.BASE + '/attendance', {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ batchId, date: attendanceDate, records: recordsArray })
            });
            if (res.ok) {
                setIsAttendanceModal(false);
                alert("Attendance saved.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading || !user) return null;

    const actualData = data.data || { contents: [], tests: [], enrollments: [] };

    return (
        <LMSShell pageTitle="Batch Administration">
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}><ArrowLeft size={18} /> Dashboard</button>
                <div className={styles.controls} style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button className={styles.primaryBtn} onClick={() => setIsAddContentModal(true)}>
                        <Plus size={18} weight="bold" /> Add Content
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => setIsCreateTestModal(true)}>
                        <Exam size={18} weight="bold" /> New Test
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => setIsAnnouncementModal(true)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                        <Megaphone size={18} weight="bold" /> Announce
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => setIsAttendanceModal(true)} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                        <CalendarCheck size={18} weight="bold" /> Attendance
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.mainColumn}>
                    <section className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <MonitorPlay size={24} color="#0881ec" />
                            <h3>Lessons & Coursework</h3>
                        </div>
                        <div className={styles.contentList}>
                            {actualData.contents.filter((c: any) => c.type === 'VIDEO').map((content: any) => (
                                <div key={content.id} className={styles.contentItem}>
                                    <div className={styles.contentIcon}><Video size={20} /></div>
                                    <div className={styles.contentText}>
                                        <h5>{content.title}</h5>
                                        <p>{content.description || "Video Lecture"}</p>
                                    </div>
                                    <a href={content.contentUrl} target="_blank" className={styles.actionBtn}>Stream Video</a>
                                </div>
                            ))}
                            {actualData.contents.filter((c: any) => c.type === 'VIDEO').length === 0 && <div className={styles.empty}>No videos uploaded yet.</div>}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <BookOpenText size={24} color="#0ea5e9" />
                            <h3>Assignments & Resources</h3>
                        </div>
                        <div className={styles.contentList}>
                            {actualData.contents.filter((c: any) => c.type !== 'VIDEO').map((content: any) => (
                                <div key={content.id} className={styles.contentItem}>
                                    <div className={styles.contentIcon} style={{ background: '#f0f9ff' }}><ClipboardText size={20} color="#0ea5e9" /></div>
                                    <div className={styles.contentText}>
                                        <h5>{content.title}</h5>
                                        <p>{content.type} • {content.description || "File download"}</p>
                                    </div>
                                    <a href={content.contentUrl} target="_blank" className={styles.actionBtn}>Download</a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className={styles.sideColumn}>
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Exam size={20} />
                            <h4>Active Tests</h4>
                        </div>
                        <div className={styles.testList}>
                            {actualData.tests.map((test: any) => (
                                <div key={test.id} className={styles.testItem}>
                                    <div className={styles.testInfo}>
                                        <span>{test.title}</span>
                                        <small>{test.totalMarks} Marks | {test.durationMinutes} min</small>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/lms/teacher/tests/${test.id}/results`)}
                                        className={styles.statBtn}
                                        title="View Results"
                                    >
                                        <ChartBar size={18} />
                                    </button>
                                </div>
                            ))}
                            {actualData.tests.length === 0 && <div className={styles.empty}>No exams created.</div>}
                        </div>
                    </section>

                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <CalendarCheck size={20} />
                            <h4>Class Size</h4>
                        </div>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>{actualData.enrollments?.length || 0}</div>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Students Enrolled</p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Modals */}
            {isAddContentModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Upload Batch Material</h3>
                            <button onClick={() => setIsAddContentModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddContent} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input required value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} placeholder="e.g. Introduction to React" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Type</label>
                                <select value={contentForm.type} onChange={e => setContentForm({ ...contentForm, type: e.target.value })}>
                                    <option value="VIDEO">Video Lecture URL</option>
                                    <option value="ASSIGNMENT">Assignment Link/File</option>
                                    <option value="RESOURCE">Other Resource (PDF, PPT)</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>URL</label>
                                <input required value={contentForm.contentUrl} onChange={e => setContentForm({ ...contentForm, contentUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={contentForm.description} onChange={e => setContentForm({ ...contentForm, description: e.target.value })} placeholder="Brief overview..." />
                            </div>
                            <button type="submit" className={styles.submitBtn}>Save</button>
                        </form>
                    </div>
                </div>
            )}

            {isCreateTestModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>New Assessment</h3>
                            <button onClick={() => setIsCreateTestModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateTest} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input required value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label>Total Marks</label>
                                    <input type="number" required value={testForm.totalMarks} onChange={e => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) })} />
                                </div>
                                <div className={styles.formGroup} style={{ flex: 1 }}>
                                    <label>Duration (Min)</label>
                                    <input type="number" required value={testForm.durationMinutes} onChange={e => setTestForm({ ...testForm, durationMinutes: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <button type="submit" className={styles.submitBtn}>Generate Test</button>
                        </form>
                    </div>
                </div>
            )}

            {isAnnouncementModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Post Announcement</h3>
                            <button onClick={() => setIsAnnouncementModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateAnnouncement} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Subject</label>
                                <input required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Priority</label>
                                <select value={announcementForm.priority} onChange={e => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}>
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message</label>
                                <textarea required value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} rows={5} />
                            </div>
                            <button type="submit" className={styles.submitBtn}>Broadcast to Batch</button>
                        </form>
                    </div>
                </div>
            )}

            {isAttendanceModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Mark Attendance</h3>
                            <button onClick={() => setIsAttendanceModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleMarkAttendance} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Date of Class</label>
                                <input type="date" required value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', marginTop: '1rem' }}>
                                {actualData.enrollments.map((enrollment: any) => (
                                    <div key={enrollment.student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 600 }}>{enrollment.student.name}</div>
                                        <select
                                            value={attendanceRecords[enrollment.student.id] || "PRESENT"}
                                            onChange={(e) => setAttendanceRecords({ ...attendanceRecords, [enrollment.student.id]: e.target.value })}
                                            style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="PRESENT">Present</option>
                                            <option value="ABSENT">Absent</option>
                                            <option value="LATE">Late</option>
                                        </select>
                                    </div>
                                ))}
                                {actualData.enrollments.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No students enrolled in this batch.</div>}
                            </div>
                            <button type="submit" className={styles.submitBtn} style={{ marginTop: '1rem' }}>Save Attendance Record</button>
                        </form>
                    </div>
                </div>
            )}

        </LMSShell>
    );
}
