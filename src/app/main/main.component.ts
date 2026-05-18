import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
}

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

  newTask = { title: '', description: '', status: 'Pending' as Task['status'], date: '' };

  tasks: Task[] = [
    { id: 1, title: 'Design Homepage', description: 'Create a modern and responsive homepage design.', status: 'Pending', date: '22 May 2025' },
    { id: 2, title: 'API Integration', description: 'Integrate the backend APIs and handle errors.', status: 'In Progress', date: '25 May 2025' },
    { id: 3, title: 'Testing & Bug Fixing', description: 'Test all features and fix the bugs before deployment.', status: 'Completed', date: '30 May 2025' },
  ];

  constructor(private auth: AuthService, private router: Router) {
    this.userName = this.auth.getUser();
    if (!this.userName) {
      this.router.navigate(['/login']);
    }
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchFilter = this.filterStatus === 'All' || t.status === this.filterStatus;
      return matchSearch && matchFilter;
    });
  }

  openAddModal() {
    this.editingId = null;
    this.newTask = { title: '', description: '', status: 'Pending', date: '' };
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
      const idx = this.tasks.findIndex(t => t.id === this.editingId);
      if (idx !== -1) {
        this.tasks[idx] = { id: this.editingId, title: this.newTask.title, description: this.newTask.description, status: this.newTask.status, date: dateStr };
      }
    } else {
      const newId = this.tasks.length ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
      this.tasks.push({ id: newId, title: this.newTask.title, description: this.newTask.description, status: this.newTask.status, date: dateStr });
    }
    this.showModal = false;
  }

  deleteTask(id: number) {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  statusColor(status: string): string {
    if (status === 'Pending') return 'yellow';
    if (status === 'In Progress') return 'blue';
    return 'green';
  }

  get totalTasks() { return this.tasks.length; }
  get completedCount() { return this.tasks.filter(t => t.status === 'Completed').length; }
  get inProgressCount() { return this.tasks.filter(t => t.status === 'In Progress').length; }
  get pendingCount() { return this.tasks.filter(t => t.status === 'Pending').length; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
