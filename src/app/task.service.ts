import { Injectable } from '@angular/core';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
}

const STORAGE_KEY = 'etm_tasks';

const DEFAULT_TASKS: Task[] = [
  { id: 1, title: 'Design Homepage', description: 'Create a modern and responsive homepage design.', status: 'Pending', date: '22 May 2025' },
  { id: 2, title: 'API Integration', description: 'Integrate the backend APIs and handle errors.', status: 'In Progress', date: '25 May 2025' },
  { id: 3, title: 'Testing & Bug Fixing', description: 'Test all features and fix the bugs before deployment.', status: 'Completed', date: '30 May 2025' },
];

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.tasks = stored ? JSON.parse(stored) : [...DEFAULT_TASKS];
      if (!stored) this.persist();
    } catch {
      this.tasks = [...DEFAULT_TASKS];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
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
    localStorage.removeItem(STORAGE_KEY);
  }
}
