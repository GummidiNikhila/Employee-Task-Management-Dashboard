import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

const STORAGE_KEY = 'etm_employees';

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@company.com', role: 'Developer' },
  { id: 2, name: 'Bob Smith', email: 'bob@company.com', role: 'Designer' },
  { id: 3, name: 'Carol Williams', email: 'carol@company.com', role: 'QA Engineer' },
  { id: 4, name: 'David Brown', email: 'david@company.com', role: 'Project Manager' },
];

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private employees: Employee[] = [];
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (!this.isBrowser) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.employees = stored ? JSON.parse(stored) : [...DEFAULT_EMPLOYEES];
      if (!stored) this.persist();
    } catch {
      this.employees = [...DEFAULT_EMPLOYEES];
    }
  }

  private persist(): void {
    if (this.isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
  }

  getAll(): Employee[] { return [...this.employees]; }

  getNames(): string[] { return this.employees.map(e => e.name); }

  add(emp: Omit<Employee, 'id'>): void {
    const newId = this.employees.length ? Math.max(...this.employees.map(e => e.id)) + 1 : 1;
    this.employees.push({ id: newId, ...emp });
    this.persist();
  }

  delete(id: number): void {
    this.employees = this.employees.filter(e => e.id !== id);
    this.persist();
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
