"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, ArrowLeft, CalendarDays, Sparkles } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  date: string;
  done: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const grid: (Date | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= totalDays; d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function formatLongDate(ymd: string): string {
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const today = new Date();
  const todayYMD = toYMD(today);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [dateInput, setDateInput] = useState(todayYMD);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  // ── Tasks ────────────────────────────────────────────────────────────────────

  function addTask() {
    const title = titleInput.trim();
    if (!title || !dateInput) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), title, date: dateInput, done: false }]);
    setTitleInput("");
    const [y, m] = dateInput.split("-").map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
  }

  function toggleDone(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function tasksForDay(ymd: string) {
    return tasks.filter(t => t.date === ymd);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const selectedDayTasks = selectedDate ? tasksForDay(selectedDate) : [];
  const doneCount = selectedDayTasks.filter(t => t.done).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-[hsl(var(--sidebar))] border-r border-border">

        {/* Logo */}
        <div className="px-6 pt-7 pb-5 border-b border-border">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/40">
              <Sparkles size={14} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Task Manager
            </h1>
          </div>
          <p className="text-xs text-muted-foreground ml-[42px]">Your intelligent day planner</p>
        </div>

        {selectedDate ? (
          /* ── Day detail ─────────────────────────────────────────────────── */
          <div className="flex flex-col flex-1 overflow-hidden">

            <div className="px-6 py-4 border-b border-border">
              <button
                onClick={() => setSelectedDate(null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to planner
              </button>
              <h2 className="text-base font-semibold leading-snug">{formatLongDate(selectedDate)}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? "s" : ""}
                </span>
                {selectedDayTasks.length > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span className={cn(
                      "text-xs font-medium",
                      doneCount === selectedDayTasks.length ? "text-emerald-500" : "text-muted-foreground"
                    )}>
                      {doneCount}/{selectedDayTasks.length} done
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {selectedDayTasks.length > 0 && (
              <div className="px-6 pt-4 pb-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(doneCount / selectedDayTasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-2">
              {selectedDayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2.5 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <CalendarDays size={20} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No tasks for this day</p>
                  <button
                    onClick={() => { setSelectedDate(null); setDateInput(selectedDate!); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Add a task →
                  </button>
                </div>
              ) : (
                selectedDayTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "group flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                      task.done
                        ? "bg-muted/30 border-border/50"
                        : "bg-white border-border shadow-sm hover:shadow-md hover:border-primary/20"
                    )}
                  >
                    {/* Custom checkbox */}
                    <button
                      onClick={() => toggleDone(task.id)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        task.done
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-muted-foreground/30 hover:border-primary"
                      )}
                    >
                      {task.done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>

                    <span className={cn(
                      "flex-1 text-sm leading-snug",
                      task.done ? "line-through text-muted-foreground" : "text-foreground font-medium"
                    )}>
                      {task.title}
                    </span>

                    <button
                      onClick={() => removeTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        ) : (
          /* ── Add task view ──────────────────────────────────────────────── */
          <div className="flex flex-col flex-1 overflow-hidden">

            <div className="px-6 py-5 flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                New Task
              </p>
              <Input
                placeholder="What needs to be done?"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTask()}
                className="bg-white shadow-sm"
              />
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-white pl-9 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button
                onClick={addTask}
                disabled={!titleInput.trim()}
                className="w-full gap-2 shadow-sm shadow-primary/20 disabled:opacity-40"
              >
                <Plus size={15} />
                Add Task
              </Button>
            </div>

            <div className="mx-6 border-t border-border" />

            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2.5 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles size={18} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                  <p className="text-xs text-muted-foreground/60">Add your first task above</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    All Tasks · {tasks.length}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {tasks.map(task => (
                      <li
                        key={task.id}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-border/60 hover:border-border hover:shadow-sm transition-all"
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 transition-colors",
                          task.done ? "bg-emerald-400" : "bg-primary"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            task.done ? "line-through text-muted-foreground" : "font-medium"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(task.date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ── Calendar ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-6 flex flex-col gap-5">

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="bg-white shadow-sm h-9 w-9">
            <ChevronLeft size={16} />
          </Button>
          <select
            value={viewMonth}
            onChange={e => setViewMonth(Number(e.target.value))}
            className="h-9 rounded-lg border border-input bg-white px-3 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={viewYear}
            onChange={e => { const y = Number(e.target.value); if (y > 1900 && y < 2200) setViewYear(y); }}
            className="h-9 w-[88px] rounded-lg border border-input bg-white px-3 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button variant="outline" size="icon" onClick={nextMonth} className="bg-white shadow-sm h-9 w-9">
            <ChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="ml-1 bg-white shadow-sm font-medium">
            Today
          </Button>
          {tasks.length > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-foreground font-medium">
                {tasks.filter(t => t.done).length}/{tasks.length} done
              </span>
            </div>
          )}
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex-1">

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={cn(
                  "py-3 text-center text-xs font-semibold uppercase tracking-wider",
                  i >= 5 ? "text-rose-400" : "text-muted-foreground"
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {Array.from({ length: grid.length / 7 }, (_, week) => (
            <div
              key={week}
              className={cn("grid grid-cols-7", week < grid.length / 7 - 1 && "border-b border-border")}
            >
              {grid.slice(week * 7, week * 7 + 7).map((day, col) => {
                const isWeekend = col >= 5;
                const isLast = col === 6;

                if (!day) return (
                  <div key={col} className={cn("min-h-[105px] bg-muted/10", !isLast && "border-r border-border")} />
                );

                const ymd = toYMD(day);
                const isToday = ymd === todayYMD;
                const isSelected = ymd === selectedDate;
                const dayTasks = tasksForDay(ymd);
                const allDone = dayTasks.length > 0 && dayTasks.every(t => t.done);

                return (
                  <div
                    key={col}
                    onClick={() => setSelectedDate(ymd)}
                    className={cn(
                      "min-h-[105px] p-2.5 flex flex-col gap-1.5 cursor-pointer transition-colors group",
                      !isLast && "border-r border-border",
                      isSelected
                        ? "bg-primary/5 ring-2 ring-inset ring-primary/25"
                        : isToday
                        ? "bg-violet-50/70 hover:bg-violet-50"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all",
                        isToday
                          ? "bg-primary text-white shadow-sm"
                          : isWeekend
                          ? "text-rose-400"
                          : "text-foreground"
                      )}>
                        {day.getDate()}
                      </span>
                      {allDone && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="6.5" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeOpacity="0.3"/>
                          <path d="M4 7L6 9L10 5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        title={task.title}
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium truncate leading-5",
                          task.done
                            ? "bg-muted text-muted-foreground line-through"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {task.title}
                      </div>
                    ))}

                    {dayTasks.length > 3 && (
                      <span className="text-[11px] text-muted-foreground px-1 font-medium">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
