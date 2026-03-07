"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import {
    UserCircle,
    MagnifyingGlass,
    Plus,
    Tag,
    Phone,
    Envelope,
    CalendarBlank,
    CheckCircle,
    X,
    Lock,
    LockOpen,
    Trash,
    PencilSimple
} from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "./admin-students.module.css";

interface BatchInfo {
    id: string;
    name: string;
    course: { title: string };
}

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    enrolledBatches: BatchInfo[];
}

export default function AdminStudentsPage() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingData, setLoadingData] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [batches, setBatches] = useState<BatchInfo[]>([]);

    // Form for new enrollment
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        batchId: "",
    });

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "SUPER_ADMIN")) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    const fetchStudents = async () => {
        if (!token) return;
        setLoadingData(true);
        try {
            const url = searchQuery
                ? `${ENDPOINTS.ADMIN.STUDENTS}?search=${encodeURIComponent(searchQuery)}`
                : ENDPOINTS.ADMIN.STUDENTS;

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setStudents(data);
        } catch (err) {
            console.error("Fetch students failed:", err);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchBatches = async () => {
        if (!token) return;
        try {
            const res = await fetch(ENDPOINTS.ADMIN.BATCHES, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setBatches(data);
        } catch (err) {
            console.error("Fetch batches failed:", err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStudents();
            fetchBatches();
        }
    }, [token, searchQuery]);

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedStudentId) {
                // Update Student
                const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${selectedStudentId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone
                    })
                });
                if (res.ok) {
                    setShowEnrollModal(false);
                    setFormData({ name: "", email: "", phone: "", batchId: "" });
                    setIsEditing(false);
                    setSelectedStudentId(null);
                    fetchStudents();
                }
            } else {
                // Create New Student
                const res = await fetch(ENDPOINTS.ADMIN.ENROLL_STUDENT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    setShowEnrollModal(false);
                    setFormData({ name: "", email: "", phone: "", batchId: "" });
                    fetchStudents();
                }
            }
        } catch (err) {
            console.error("Operation failed:", err);
        }
    };

    const handleEditClick = (student: Student) => {
        setIsEditing(true);
        setSelectedStudentId(student.id);
        setFormData({
            name: student.name,
            email: student.email,
            phone: student.phone || "",
            batchId: "" // Batch change handling can be separate or added later
        });
        setShowEnrollModal(true);
    };

    const handleToggleStatus = async (studentId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${studentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) fetchStudents();
        } catch (err) {
            console.error("Status toggle failed:", err);
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm("Are you sure you want to delete this student permanently?")) return;
        try {
            const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${studentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchStudents();
        } catch (err) {
            console.error("Deletion failed:", err);
        }
    };

    if (isLoading || !user) return null;

    return (
        <LMSShell pageTitle="Student Records">
            <div className={styles.container}>
                <div className={styles.headerCard}>
                    <div className={styles.headerInfo}>
                        <h1>Manage Students</h1>
                        <p>Manage student profiles across all academic batches.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <div className={styles.searchBox}>
                            <MagnifyingGlass size={20} />
                            <input
                                type="text"
                                placeholder="Search Students"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={styles.enrollBtn} onClick={() => { setIsEditing(false); setFormData({ name: "", email: "", phone: "", batchId: "" }); setShowEnrollModal(true); }}>
                            <Plus size={18} weight="bold" /> Enroll New
                        </button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.studentTable}>
                        <thead>
                            <tr>
                                <th>STUDENT</th>
                                <th>BATCHES</th>
                                <th>CONTACT</th>
                                <th>JOINED DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingData ? (
                                <tr><td colSpan={6} className={styles.empty}>Loading intelligence database...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={6} className={styles.empty}>No student records matched your query.</td></tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div className={styles.studentInfo}>
                                                <div className={styles.avatar}>
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={styles.name}>{student.name}</div>
                                                    <div className={styles.email}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.batchList}>
                                                {student.enrolledBatches?.length > 0 ? (
                                                    student.enrolledBatches.map(b => (
                                                        <div key={b.id} className={styles.batchItem}>
                                                            <Tag size={12} /> {b.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className={styles.unassigned}>No Batches</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contact}>
                                                {student.phone || "Not provided"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.date}>
                                                {new Date(student.createdAt).toISOString().split('T')[0]}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleStatus(student.id, student.isActive)}
                                                className={styles.toggleSwitch}
                                                title={student.isActive ? "Click to Block" : "Click to Activate"}
                                            >
                                                <div className={`${styles.toggleTrack} ${student.isActive ? styles.on : styles.off}`}>
                                                    <div className={styles.toggleThumb} />
                                                </div>
                                                <span className={`${styles.toggleLabel} ${!student.isActive ? styles.off : ""}`}>
                                                    {student.isActive ? "Active" : "Blocked"}
                                                </span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button onClick={() => handleEditClick(student)} className={styles.editBtn} title="Edit Information">
                                                    <PencilSimple size={18} weight="bold" />
                                                </button>
                                                <button onClick={() => handleDeleteStudent(student.id)} className={styles.deleteBtn} title="Delete Permanently">
                                                    <Trash size={18} weight="bold" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showEnrollModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>{isEditing ? "Update Student Profile" : "Enroll New Student"}</h3>
                            <button onClick={() => setShowEnrollModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEnroll} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="student@example.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                            </div>
                            {!isEditing && (
                                <div className={styles.formGroup}>
                                    <label>Assign Batch (Optional)</label>
                                    <select value={formData.batchId} onChange={e => setFormData({ ...formData, batchId: e.target.value })}>
                                        <option value="">Select a batch</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name} ({b.course?.title})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button type="submit" className={styles.submitBtn}>
                                {isEditing ? "Save Changes" : "Complete Enrollment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </LMSShell>
    );
}
