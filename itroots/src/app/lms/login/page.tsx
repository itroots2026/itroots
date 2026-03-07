"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    GraduationCap,
    PlayCircle,
    ClipboardText,
    ChartBar,
    Calendar,
    Megaphone,
    Eye,
    EyeSlash,
    Envelope,
    Lock,
    ArrowRight,
    ArrowLeft,
    Users,
    Medal,
    BookOpen,
    Warning
} from "@phosphor-icons/react";
import { useLMSAuth } from "../auth-context";
import { USERS } from "@/data/lms-data";
import styles from "./login.module.css";

const FEATURES = [
    { icon: PlayCircle, text: "HD Video Lessons", sub: "Learn anytime, anywhere" },
    { icon: ClipboardText, text: "Tests & Assignments", sub: "Auto-graded assessments" },
    { icon: ChartBar, text: "Progress Tracking", sub: "Real-time analytics" },
    { icon: Calendar, text: "Class Schedule", sub: "Batch timetable" },
    { icon: Megaphone, text: "Announcements", sub: "Stay updated daily" },
    { icon: BookOpen, text: "Study Resources", sub: "PDFs, PPTs & notes" },
];

export default function LMSLoginPage() {
    const router = useRouter();
    const { login, register, logout } = useLMSAuth();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("STUDENT"); // 'STUDENT' | 'TEACHER'
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        if (isRegisterMode) {
            const result = await register(name.trim(), email.trim(), password, role);
            if (result.success) {
                setSuccessMsg("Account created! Please wait for Admin approval before logging in.");
                setIsRegisterMode(false);
                setPassword("");
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        } else {
            const result = await login(email.trim(), password);

            if (result.success) {
                const userRole = result.user?.role;

                if (userRole === "SUPER_ADMIN" || userRole === "CMS_MANAGER") {
                    logout();
                    setError("Access Denied: Please use admin.itroots.com (or admin.localhost:3000 in dev)");
                    setIsLoading(false);
                } else if (userRole === "STUDENT") {
                    router.push("/dashboard");
                } else {
                    logout();
                    setError("This portal is for students. Please use the Instructor Portal.");
                    setIsLoading(false);
                }
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        }
    }

    return (
        <div className={styles.loginPage}>
            {/* ── Left Brand Panel (Light BG for logo visibility) ── */}
            <div className={styles.brandPanel}>
                {/* Wireframe decorations */}
                <div className={styles.wireCircle1} />
                <div className={styles.wireCircle2} />
                <div className={styles.wireLine1} />
                <div className={styles.wireLine2} />

                <div className={styles.brandContent}>
                    <div className={styles.brandLogo}>
                        <Link href="/">
                            <Image
                                src="/images/logo.png"
                                alt="ITROOTS"
                                width={200}
                                height={65}
                                style={{ height: '65px', width: 'auto', cursor: 'pointer' }}
                                priority
                            />
                        </Link>
                    </div>

                    <h1 className={styles.brandHeading}>
                        Your Learning<br />
                        Journey <span>Starts Here.</span>
                    </h1>
                    <p className={styles.brandDescription}>
                        Access courses, track progress, and build career-ready skills — all in one portal.
                    </p>

                    {/* Feature Grid */}
                    <div className={styles.featureGrid}>
                        {FEATURES.map((f) => (
                            <div key={f.text} className={styles.featureCard}>
                                <div className={styles.featureIconWrap}>
                                    <f.icon size={20} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <div className={styles.featureTitle}>{f.text}</div>
                                    <div className={styles.featureSub}>{f.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <Users size={18} strokeWidth={1.5} />
                            <span className={styles.statNum}>1000+</span>
                            <span className={styles.statLabel}>Students</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.statItem}>
                            <Medal size={18} />
                            <span className={styles.statNum}>95%</span>
                            <span className={styles.statLabel}>Placement</span>
                        </div>
                        <div className={styles.statDivider} />
                        <div className={styles.statItem}>
                            <BookOpen size={18} strokeWidth={1.5} />
                            <span className={styles.statNum}>15+</span>
                            <span className={styles.statLabel}>Courses</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className={styles.formPanel}>
                <div className={styles.formCard}>
                    {/* Student Icon + Title */}
                    <div className={styles.formHeader}>
                        <div className={styles.studentBadge}>
                            {isRegisterMode ? <Users size={28} strokeWidth={1.8} /> : <GraduationCap size={28} strokeWidth={1.8} />}
                        </div>
                        <h2 className={styles.formTitle}>{isRegisterMode ? "Create Account" : "Welcome Back"}</h2>
                        <p className={styles.formSubtitle}>{isRegisterMode ? "Sign up to join the portal" : "Sign in to your learning portal"}</p>
                    </div>

                    {error && (
                        <div className={styles.errorBox} role="alert">
                            <Warning size={18} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className={styles.successBox} role="alert" style={{ background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', marginBottom: '20px', fontSize: '14px' }}>
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className={styles.fieldGroup}>
                            {isRegisterMode && (
                                <>
                                    <div>
                                        <label className={styles.fieldLabel} htmlFor="lms-name">Full Name</label>
                                        <div className={styles.fieldWrapper}>
                                            <input
                                                id="lms-name"
                                                type="text"
                                                className={styles.fieldInput}
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.fieldLabel} htmlFor="lms-role">I am a</label>
                                        <div className={styles.fieldWrapper}>
                                            <select
                                                id="lms-role"
                                                className={styles.fieldInput}
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                style={{ appearance: 'none' }}
                                            >
                                                <option value="STUDENT">Student</option>
                                                <option value="TEACHER">Teacher</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className={styles.fieldLabel} htmlFor="lms-email">Email Address</label>
                                <div className={styles.fieldWrapper}>
                                    <Envelope size={16} className={styles.fieldIconSvg} />
                                    <input
                                        id="lms-email"
                                        type="email"
                                        className={styles.fieldInput}
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={styles.fieldLabel} htmlFor="lms-password">Password</label>
                                <div className={styles.fieldWrapper}>
                                    <Lock size={16} className={styles.fieldIconSvg} />
                                    <input
                                        id="lms-password"
                                        type={showPass ? "text" : "password"}
                                        className={styles.fieldInput}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPass(!showPass)}
                                    >
                                        {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>



                        <button
                            id="lms-login-btn"
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>{isRegisterMode ? "Signing Up..." : "Signing In..."}</>
                            ) : (
                                <>{isRegisterMode ? "Create Account" : "Sign In"} <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
                        {isRegisterMode ? (
                            <>Already have an account? <span onClick={() => setIsRegisterMode(false)} style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}>Sign In</span></>
                        ) : (
                            <>Not registered? <span onClick={() => setIsRegisterMode(true)} style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}>Create an Account</span></>
                        )}
                    </div>

                </div>

                {/* Student Illustration at the bottom of the black panel */}
                <div className={styles.studentIllustration}>
                    <Image
                        src="/images/student-login-art.png.png"
                        alt="Students Illustration"
                        width={350}
                        height={250}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
