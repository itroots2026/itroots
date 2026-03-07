"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import {
    MagnifyingGlass,
    Plus,
    X,
    Trash,
    UserCircle,
    Phone,
    Envelope,
    Briefcase,
    PencilSimple
} from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "../students/admin-students.module.css"; // Reuse the students CSS for consistency

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminTeachersPage() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingData, setLoadingData] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    // Form for editing teacher
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "SUPER_ADMIN")) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    const fetchTeachers = async () => {
        if (!token) return;
        setLoadingData(true);
        try {
            const url = searchQuery
                ? `${ENDPOINTS.ADMIN.TEACHERS}?search=${encodeURIComponent(searchQuery)}`
                : ENDPOINTS.ADMIN.TEACHERS;

            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setTeachers(data);
        } catch (err) {
            console.error("Fetch teachers failed:", err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTeachers();
        }
    }, [token, searchQuery]);

    const handleEditClick = (teacher: Teacher) => {
        setSelectedTeacherId(teacher.id);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || ""
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacherId) return;
        try {
            const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${selectedTeacherId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowEditModal(false);
                fetchTeachers();
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleToggleStatus = async (teacherId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${teacherId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) fetchTeachers();
        } catch (err) {
            console.error("Status toggle failed:", err);
        }
    };

    const handleDeleteTeacher = async (teacherId: string) => {
        if (!confirm("Are you sure you want to delete this teacher permanently?")) return;
        try {
            const res = await fetch(`${ENDPOINTS.ADMIN.USERS}/${teacherId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchTeachers();
        } catch (err) {
            console.error("Deletion failed:", err);
        }
    };

    if (isLoading || !user) return null;

    return (
        <LMSShell pageTitle="Instructor Faculty">
            <div className={styles.container}>
                <div className={styles.headerCard}>
                    <div className={styles.headerInfo}>
                        <h1>Manage Teachers</h1>
                        <p>Manage teachers access, visibility, and status.</p>
                    </div>
                    <div className={styles.headerActions}>

                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.studentTable}>
                        <thead>
                            <tr>
                                <th>INSTRUCTOR</th>
                                <th>CONTACT</th>
                                <th>JOINED DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingData ? (
                                <tr><td colSpan={5} className={styles.empty}>Accessing faculty database...</td></tr>
                            ) : teachers.length === 0 ? (
                                <tr><td colSpan={5} className={styles.empty}>No instructors found.</td></tr>
                            ) : (
                                teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td>
                                            <div className={styles.studentInfo}>
                                                <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #0881ec, #06b6d4)' }}>
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={styles.name}>{teacher.name}</div>
                                                    <div className={styles.email}>{teacher.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contact}>
                                                {teacher.phone || "No phone added"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.date}>
                                                {new Date(teacher.createdAt).toISOString().split('T')[0]}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleStatus(teacher.id, teacher.isActive)}
                                                className={styles.toggleSwitch}
                                                title={teacher.isActive ? "Click to Block" : "Click to Activate"}
                                            >
                                                <div className={`${styles.toggleTrack} ${teacher.isActive ? styles.on : styles.off}`}>
                                                    <div className={styles.toggleThumb} />
                                                </div>
                                                <span className={`${styles.toggleLabel} ${!teacher.isActive ? styles.off : ""}`}>
                                                    {teacher.isActive ? "Active" : "Blocked"}
                                                </span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button onClick={() => handleEditClick(teacher)} className={styles.editBtn} title="Edit Information">
                                                    <PencilSimple size={18} weight="bold" />
                                                </button>
                                                <button onClick={() => handleDeleteTeacher(teacher.id)} className={styles.deleteBtn} title="Delete Permanently">
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

            {showEditModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Edit Instructor Profile</h3>
                            <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdate} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Full Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Instructor Name" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="instructor@example.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Contact Number" />
                            </div>
                            <button type="submit" className={styles.submitBtn}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </LMSShell>
    );
}
