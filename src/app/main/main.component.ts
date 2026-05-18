import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { TaskService, Task } from '../task.service';

@Component({
  selector: 'app-main',
  imports: [FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  userName: string | null;
  darkMode = false;
  sidebarOpen = true;
  showModal = false;
  activeView = 'Dashboard';
  searchQuery = '';
  filterStatus = 'All';
  editingId: number | null = null;
  defaultTaskStatus: Task['status'] = 'Pending';

  newTask = { title: '', description: '', status: 'Pending' as Task['status'], date: '' };
  tasks: Task[] = [];

  constructor(private auth: AuthService, private router: Router, private taskService: TaskService) {
    this.userName = this.auth.getUser();
    if (!this.userName) {
      this.router.navigate(['/login']);
    }
    this.tasks = this.taskService.getAll();
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchFilter = this.filterStatus === 'All' || t.status === this.filterStatus;
      return matchSearch && matchFilter;
    });
  }

  get recentTasks(): Task[] {
    return [...this.tasks].reverse().slice(0, 5);
  }

  get completionPercent(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.completedCount / this.tasks.length) * 100);
  }

  get totalTasks() { return this.tasks.length; }
  get completedCount() { return this.tasks.filter(t => t.status === 'Completed').length; }
  get inProgressCount() { return this.tasks.filter(t => t.status === 'In Progress').length; }
  get pendingCount() { return this.tasks.filter(t => t.status === 'Pending').length; }

  openAddModal() {
    this.editingId = null;
    this.newTask = { title: '', description: '', status: this.defaultTaskStatus, date: '' };
    this.showModal = true;
  }

  editTask(task: Task) {
    this.editingId = task.id;
    this.newTask = { title: task.title, description: task.description, status: task.status, date: task.date };
    this.showModal = true;
  }

  saveTask() {
    if (!this.newTask.title.trim()) return;
    const today = new Date();
    const dateStr = this.newTask.date || today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (this.editingId !== null) {
      this.taskService.update(this.editingId, { ...this.newTask, date: dateStr });
    } else {
      this.taskService.add({ ...this.newTask, date: dateStr });
    }
    this.tasks = this.taskService.getAll();
    this.showModal = false;
  }

  deleteTask(id: number) {
    this.taskService.delete(id);
    this.tasks = this.taskService.getAll();
  }

  clearAllTasks() {
    this.taskService.clearAll();
    this.tasks = [];
  }

  statusColor(status: string): string {
    if (status === 'Pending') return 'yellow';
    if (status === 'In Progress') return 'blue';
    return 'green';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
