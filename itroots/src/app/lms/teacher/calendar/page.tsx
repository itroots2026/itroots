"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLMSAuth } from "@/app/lms/auth-context";
import LMSShell from "@/components/lms/LMSShell";
import { CaretLeft, CaretRight, CalendarDots, Plus, Clock, BookOpen } from "@phosphor-icons/react";
import { ENDPOINTS } from "@/config/api";
import styles from "./calendar.module.css";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ABBR_MAP: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};
const BATCH_COLORS = ["#0881ec", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

function parseBatchDays(schedule: string): number[] {
    return Object.entries(DAY_ABBR_MAP)
        .filter(([abbr]) => schedule.includes(abbr))
        .map(([, idx]) => idx);
}

function getEventsForDate(date: Date, batches: any[]) {
    const dow = date.getDay();
    return batches
        .filter(b => parseBatchDays(b.schedule).includes(dow))
        .map((b, i) => ({
            id: b.id,
            title: b.name,
            course: b.course?.title || "",
            time: b.schedule.split("—")[1]?.trim() || b.schedule,
            color: BATCH_COLORS[i % BATCH_COLORS.length],
        }));
}

export default function TeacherCalendarPage() {
    const { user, isLoading, token } = useLMSAuth();
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [batches, setBatches] = useState<any[]>([]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "TEACHER")) {
            router.push("/lms/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!token) return;
        fetch(ENDPOINTS.TEACHER.MY_BATCHES, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setBatches(d); })
            .catch(console.error);
    }, [token]);

    if (isLoading || !user) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    const prev = () => setCurrentDate(new Date(year, month - 1, 1));
    const next = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
    };

    const isToday = (day: number) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const isSelected = (day: number) =>
        day === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear();

    const selectedEvents = getEventsForDate(selectedDate, batches);

    return (
        <LMSShell pageTitle="Event Calendar">
            <div className={styles.page}>
                {/* Banner */}
                <div className={styles.banner}>
                    <div>
                        <div className={styles.bannerTitle}>Event Calendar</div>
                        <div className={styles.bannerSub}>Schedule and manage your classes, assignments, and exams.</div>
                    </div>
                    <CalendarDots size={60} color="rgba(255,255,255,0.2)" weight="duotone" />
                </div>

                {/* Calendar + Events */}
                <div className={styles.calLayout}>

                    {/* ── React Calendar ── */}
                    <div className={styles.calendarCard}>
                        {/* Header */}
                        <div className={styles.calHeader}>
                            <button className={styles.navBtn} onClick={prev}>
                                <CaretLeft size={18} weight="bold" />
                            </button>
                            <div className={styles.calMonthGroup}>
                                <span className={styles.calMonth}>{MONTH_NAMES[month]} {year}</span>
                                <button className={styles.todayBtn} onClick={goToday}>Today</button>
                            </div>
                            <button className={styles.navBtn} onClick={next}>
                                <CaretRight size={18} weight="bold" />
                            </button>
                        </div>

                        {/* Week labels */}
                        <div className={styles.weekRow}>
                            {WEEK_DAYS.map(d => (
                                <div key={d} className={styles.weekLabel}>{d}</div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className={styles.daysGrid}>
                            {/* Empty cells before first day */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className={styles.dayCell} />
                            ))}

                            {/* Day cells */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const date = new Date(year, month, day);
                                const events = getEventsForDate(date, batches);
                                const todayCell = isToday(day);
                                const selectedCell = isSelected(day) && !todayCell;

                                return (
                                    <div
                                        key={day}
                                        className={`${styles.dayCell} ${styles.dayCellClickable}
                                            ${todayCell ? styles.todayCell : ""}
                                            ${selectedCell ? styles.selectedCell : ""}`}
                                        onClick={() => setSelectedDate(new Date(year, month, day))}
                                    >
                                        <span className={styles.dayNum}>{day}</span>
                                        {events.length > 0 && (
                                            <div className={styles.eventDots}>
                                                {events.slice(0, 3).map((ev, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={styles.dot}
                                                        style={{ background: ev.color }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        {batches.length > 0 && (
                            <div className={styles.legend}>
                                {batches.map((b, i) => (
                                    <div key={b.id} className={styles.legendItem}>
                                        <span className={styles.legendDot} style={{ background: BATCH_COLORS[i % BATCH_COLORS.length] }} />
                                        <span className={styles.legendLabel}>{b.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Events Panel ── */}
                    <div className={styles.eventsPanel}>
                        <div className={styles.eventsPanelHeader}>
                            <div>
                                <div className={styles.eventsPanelDay}>
                                    {selectedDate.toLocaleDateString("en-IN", { weekday: "long" })}
                                </div>
                                <div className={styles.eventsPanelDate}>
                                    {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </div>
                            </div>
                            <button className={styles.addEventBtn}>
                                <Plus size={14} weight="bold" /> Add
                            </button>
                        </div>

                        <div className={styles.eventsBody}>
                            {selectedEvents.length === 0 ? (
                                <div className={styles.noEvents}>
                                    <CalendarDots size={44} color="#cbd5e1" weight="duotone" />
                                    <p>No classes on this day</p>
                                </div>
                            ) : (
                                <div className={styles.eventsList}>
                                    {selectedEvents.map(ev => (
                                        <div key={ev.id} className={styles.eventItem}>
                                            <div className={styles.eventAccent} style={{ background: ev.color }} />
                                            <div className={styles.eventInfo}>
                                                <div className={styles.eventTitle}>{ev.title}</div>
                                                <div className={styles.eventMeta}>
                                                    <BookOpen size={12} />
                                                    <span>{ev.course}</span>
                                                </div>
                                                <div className={styles.eventMeta}>
                                                    <Clock size={12} />
                                                    <span>{ev.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </LMSShell>
    );
}
