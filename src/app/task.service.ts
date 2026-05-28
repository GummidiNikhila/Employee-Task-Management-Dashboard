import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  date: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'etm_tasks';
const VERSION_KEY  = 'etm_version';
const CURRENT_VER  = '2';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [];
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) return;

    // Version bump clears old seeded demo data so new users start blank.
    if (localStorage.getItem(VERSION_KEY) !== CURRENT_VER) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, CURRENT_VER);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Task[] = JSON.parse(stored);
        this.tasks = parsed.map(t => ({
          ...t,
          priority: t.priority ?? ('Medium' as Task['priority']),
          assignee: t.assignee ?? '',
          date: t.date ?? '',
        }));
      }
    } catch {
      this.tasks = [];
    }
  }

  private persist(): void {
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  getAll(): Task[] {
    return [...this.tasks];
  }

  add(task: Omit<Task, 'id'>): void {
    const newId = this.tasks.length ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
    this.tasks.push({ id: newId, ...task });
    this.persist();
  }

  update(id: number, updates: Omit<Task, 'id'>): void {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = { id, ...updates };
      this.persist();
    }
  }

  delete(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.persist();
  }

  clearAll(): void {
    this.tasks = [];
    if (this.isBrowser) localStorage.removeItem(STORAGE_KEY);
  }
}
