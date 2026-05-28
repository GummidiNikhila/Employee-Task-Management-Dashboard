import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { TaskService, Task } from '../task.service';
import { EmployeeService, Employee } from '../employee.service';

type SortKey = 'priority' | 'date' | 'title' | 'status';

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER: Record<string, number> = { Pending: 0, 'In Progress': 1, Completed: 2 };
const STATUS_CYCLE: Record<string, Task['status']> = {
  Pending: 'In Progress',
  'In Progress': 'Completed',
  Completed: 'Pending',
};

@Component({
  selector: 'app-main',
  imports: [FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  userName: string | null;
  darkMode = false;
  sidebarOpen = false;
  showModal = false;
  showEmpModal = false;
  showNotifPanel = false;
  activeView = 'Dashboard';
  searchQuery = '';
  filterStatus = 'All';
  filterPriority = 'All';
  filterAssignee = 'All';
  sortKey: SortKey = 'priority';
  editingId: number | null = null;
  defaultTaskStatus: Task['status'] = 'Pending';
  viewMode: 'grid' | 'list' | 'kanban' = 'list';

  newTask: Omit<Task, 'id'> = {
    title: '', description: '',
    status: 'Pending', priority: 'Medium', assignee: '', date: ''
  };
  newEmployee = { name: '', email: '', role: '' };
  titleError = false;

  tasks: Task[] = [];
  employees: Employee[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private auth: AuthService,
    private router: Router,
    private taskService: TaskService,
    private employeeService: EmployeeService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.sidebarOpen = window.innerWidth >= 768;
    }
    this.userName = this.auth.getUser();
    if (!this.userName) { this.router.navigate(['/login']); }
    this.tasks = this.taskService.getAll();
    this.employees = this.employeeService.getAll();
  }

  // ── Computed counts ──────────────────────────────────────
  get totalTasks()      { return this.tasks.length; }
  get completedCount()  { return this.tasks.filter(t => t.status === 'Completed').length; }
  get inProgressCount() { return this.tasks.filter(t => t.status === 'In Progress').length; }
  get pendingCount()    { return this.tasks.filter(t => t.status === 'Pending').length; }
  get highCount()       { return this.tasks.filter(t => t.priority === 'High').length; }
  get overdueCount()    { return this.tasks.filter(t => this.isOverdue(t.date) && t.status !== 'Completed').length; }

  get completionPercent(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.completedCount / this.tasks.length) * 100);
  }

  get employeeNames(): string[] {
    return this.employeeService.getNames();
  }

  get overdueNotifications(): Task[] {
    return this.tasks.filter(t => this.isOverdue(t.date) && t.status !== 'Completed');
  }

  get dueTodayCount(): number {
    return this.tasks.filter(t => this.isDueToday(t.date) && t.status !== 'Completed').length;
  }

  get completionRingOffset(): number {
    const circumference = 2 * Math.PI * 36;
    return circumference * (1 - this.completionPercent / 100);
  }

  get timeOfDay(): string {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  get todayDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // ── Filtered & sorted task list ──────────────────────────
  get filteredTasks(): Task[] {
    const q = this.searchQuery.toLowerCase();
    const list = this.tasks.filter(t => {
      const matchSearch   = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchStatus   = this.filterStatus   === 'All' || t.status    === this.filterStatus;
      const matchPriority = this.filterPriority === 'All' || t.priority  === this.filterPriority;
      const matchAssignee = this.filterAssignee === 'All' || t.assignee  === this.filterAssignee;
      return matchSearch && matchStatus && matchPriority && matchAssignee;
    });
    return this.applySortToList(list);
  }

  get recentTasks(): Task[] {
    return [...this.tasks].slice(-5).reverse();
  }

  applySortToList(list: Task[]): Task[] {
    return [...list].sort((a, b) => {
      if (this.sortKey === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (this.sortKey === 'status')   return STATUS_ORDER[a.status]   - STATUS_ORDER[b.status];
      if (this.sortKey === 'title')    return a.title.localeCompare(b.title);
      return (b.date || '').localeCompare(a.date || '');
    });
  }

  // ── Quick status cycle ───────────────────────────────────
  cycleStatus(task: Task): void {
    const next = STATUS_CYCLE[task.status];
    this.taskService.update(task.id, { ...task, status: next });
    this.tasks = this.taskService.getAll();
  }

  // ── Task CRUD ────────────────────────────────────────────
  readonly kanbanCols = [
    { status: 'Pending' as const,     label: 'Pending',     colorClass: 'kch-amber' },
    { status: 'In Progress' as const, label: 'In Progress', colorClass: 'kch-blue'  },
    { status: 'Completed' as const,   label: 'Completed',   colorClass: 'kch-green' },
  ];

  tasksForStatus(status: Task['status']): Task[] {
    const q = this.searchQuery.toLowerCase();
    return this.tasks.filter(t => {
      if (t.status !== status) return false;
      const matchSearch   = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchPriority = this.filterPriority === 'All' || t.priority === this.filterPriority;
      const matchAssignee = this.filterAssignee === 'All' || t.assignee  === this.filterAssignee;
      return matchSearch && matchPriority && matchAssignee;
    });
  }

  openAddModal(statusOverride?: Task['status']): void {
    this.editingId = null;
    this.titleError = false;
    this.newTask = { title: '', description: '', status: statusOverride ?? this.defaultTaskStatus, priority: 'Medium', assignee: '', date: '' };
    this.showModal = true;
  }

  editTask(task: Task): void {
    this.editingId = task.id;
    this.titleError = false;
    this.newTask = { title: task.title, description: task.description, status: task.status, priority: task.priority, assignee: task.assignee, date: task.date };
    this.showModal = true;
  }

  saveTask(): void {
    if (!this.newTask.title.trim()) { this.titleError = true; return; }
    this.titleError = false;
    if (this.editingId !== null) {
      this.taskService.update(this.editingId, { ...this.newTask });
    } else {
      this.taskService.add({ ...this.newTask });
    }
    this.tasks = this.taskService.getAll();
    this.showModal = false;
  }

  deleteTask(id: number): void {
    if (!confirm('Delete this task?')) return;
    this.taskService.delete(id);
    this.tasks = this.taskService.getAll();
  }

  clearAllTasks(): void {
    if (!confirm('Delete ALL tasks? This cannot be undone.')) return;
    this.taskService.clearAll();
    this.tasks = [];
  }

  // ── Employee CRUD ────────────────────────────────────────
  saveEmployee(): void {
    if (!this.newEmployee.name.trim() || !this.newEmployee.email.trim()) return;
    this.employeeService.add({ ...this.newEmployee });
    this.employees = this.employeeService.getAll();
    this.newEmployee = { name: '', email: '', role: '' };
    this.showEmpModal = false;
  }

  deleteEmployee(id: number): void {
    if (!confirm('Remove this team member?')) return;
    this.employeeService.delete(id);
    this.employees = this.employeeService.getAll();
  }

  // ── Per-employee stats ───────────────────────────────────
  taskCountFor(name: string): number {
    return this.tasks.filter(t => t.assignee === name).length;
  }
  completedCountFor(name: string): number {
    return this.tasks.filter(t => t.assignee === name && t.status === 'Completed').length;
  }
  activeCountFor(name: string): number {
    return this.tasks.filter(t => t.assignee === name && t.status === 'In Progress').length;
  }
  progressFor(name: string): number {
    const total = this.taskCountFor(name);
    if (!total) return 0;
    return Math.round((this.completedCountFor(name) / total) * 100);
  }

  // ── Helpers ──────────────────────────────────────────────
  isOverdue(date: string): boolean {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    return date < new Date().toISOString().slice(0, 10);
  }

  isDueToday(date: string): boolean {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    return date === new Date().toISOString().slice(0, 10);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return date;
  }

  relativeDate(date: string): string {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(date + 'T00:00:00');
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0)  return 'Today';
    if (diff === 1)  return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1 && diff <= 14) return `In ${diff}d`;
    if (diff < 0)    return `${-diff}d overdue`;
    return this.formatDate(date);
  }

  initials(name: string): string {
    return this.employeeService.initials(name);
  }

  avatarColor(name: string): string {
    const palette = ['#0284c7','#7c3aed','#dc2626','#059669','#d97706','#db2777','#0891b2'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }

  statusColor(status: string): string {
    if (status === 'Pending') return 'yellow';
    if (status === 'In Progress') return 'blue';
    return 'green';
  }

  priorityColor(priority: string): string {
    if (priority === 'High')   return 'red';
    if (priority === 'Medium') return 'amber';
    return 'gray';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
