"use client";

import { useEffect, useState } from "react";
import { useLMSAuth } from "@/app/lms/auth-context";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, Eye, ArrowLeft, FloppyDisk } from "@phosphor-icons/react";
import Link from "next/link";
import LMSShell from "@/components/lms/LMSShell";
import styles from "./courses-manager.module.css";
import { ENDPOINTS } from "@/config/api";

export default function CoursesManager() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        title: "",
        description: "",
        thumbnail: "",
        slug: "",
        price: 0,
        category: "",
        isPublished: false
    });

    useEffect(() => {
        if (!isLoading && (!user || (user.role !== "CMS_MANAGER" && user.role !== "SUPER_ADMIN"))) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    const fetchCourses = async () => {
        if (token) {
            try {
                const res = await fetch(ENDPOINTS.CMS.COURSES, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error("Course fetch failed:", err);
            }
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [token]);

    const handleSave = async (e: any) => {
        e.preventDefault();
        const url = formData.id
            ? `${ENDPOINTS.CMS.COURSES}/${formData.id}`
            : ENDPOINTS.CMS.COURSES;

        const method = formData.id ? "PUT" : "POST";

        try {
            await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            setIsEditing(false);
            setFormData({ id: "", title: "", description: "", thumbnail: "", slug: "", price: 0, category: "", isPublished: false });
            fetchCourses();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this course from the public website?")) {
            await fetch(`${ENDPOINTS.CMS.COURSES}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchCourses();
        }
    };

    if (isLoading || !user) return <div className={styles.container}>Loading CMS...</div>;

    return (
        <LMSShell pageTitle="Manage Courses">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>

                        <h1>Manage Courses</h1>
                        <p>Add, edit, and publish courses to the main ITROOTS website dynamically.</p>
                    </div>
                    {!isEditing && (
                        <button className={styles.actionBtnPrimary} onClick={() => {
                            setFormData({ id: "", title: "", description: "", thumbnail: "", slug: "", price: 0, category: "", isPublished: false });
                            setIsEditing(true);
                        }}>
                            <Plus size={20} /> Add New Course
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className={styles.card}>
                        <h2>{formData.id ? "Edit Course" : "Create New Course"}</h2>
                        <form onSubmit={handleSave} className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Course Title</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Master Data Science" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description (Short summary for cards)</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Thumbnail Image URL</label>
                                <input value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="/courses/ds-thumb.jpg or https://..." />
                            </div>
                            <div className={styles.formGroupRow}>
                                <div className={styles.formGroup}>
                                    <label>Price ($)</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. AI & ML" />
                                </div>
                            </div>
                            <div className={styles.formGroupCheckbox}>
                                <input type="checkbox" id="published" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
                                <label htmlFor="published">Publish to Public Website</label>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}><FloppyDisk size={20} /> Save Course</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Thumbnail</th>
                                    <th>Course Details</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No courses found in database. Create one to display it on the public site!</td></tr>
                                ) : courses.map((course: any) => (
                                    <tr key={course.id}>
                                        <td>
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className={styles.thumb} />
                                            ) : (
                                                <div className={styles.placeholderThumb}>No Img</div>
                                            )}
                                        </td>
                                        <td>
                                            <strong>{course.title}</strong>
                                            <div className={styles.slugText}>/courses/{course.slug}</div>
                                        </td>
                                        <td><span className={styles.tag}>{course.category || "Uncategorized"}</span></td>
                                        <td>
                                            {course.isPublished ? <span className={styles.statusLive}>Live</span> : <span className={styles.statusDraft}>Draft</span>}
                                        </td>
                                        <td>
                                            <div className={styles.actionLinks}>
                                                <button onClick={() => { setFormData(course); setIsEditing(true); }} className={styles.iconBtn}><PencilSimple size={18} /></button>
                                                <button onClick={() => handleDelete(course.id)} className={`${styles.iconBtn} ${styles.danger}`}><Trash size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </LMSShell>
    );
}
