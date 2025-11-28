"use server";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// In-memory storage for demo purposes
const tasks: Task[] = [];

export async function createTask(formData: FormData): Promise<Task> {
  const title = formData.get("title") as string;
  
  if (!title || title.trim() === "") {
    throw new Error("Task title is required");
  }

  const task: Task = {
    id: Date.now().toString(),
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
  };

  tasks.push(task);
  return task;
}

export async function getTasks(): Promise<Task[]> {
  return [...tasks];
}

export async function toggleTask(taskId: string): Promise<Task | null> {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    return task;
  }
  return null;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks.splice(index, 1);
    return true;
  }
  return false;
}
