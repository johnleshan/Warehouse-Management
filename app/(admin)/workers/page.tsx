'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStorageSync } from '@/hooks/useStorageSync';
import { storage } from '@/lib/storage';
import { User, Task } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function WorkersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // New Task Form
    const [selectedUserId, setSelectedUserId] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const loadData = useCallback(async () => {
        await storage.init();
        const [u, t] = await Promise.all([
            storage.getUsers(),
            storage.getTasks()
        ]);
        setUsers(u);
        setTasks(t);
    }, []);

    useStorageSync(loadData);

    useEffect(() => {
        if (typeof window !== 'undefined') loadData();
    }, [loadData]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !taskDescription) return;

        const newTask: Task = {
            id: generateId(),
            userId: selectedUserId,
            description: taskDescription,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
        await storage.addTask(newTask);
        loadData();
        setTaskDescription('');
        setIsTaskModalOpen(false);
    };

    const handleCompleteTask = async (task: Task) => {
        const updatedTask = { ...task, status: 'COMPLETED' as const, completedAt: new Date().toISOString() };
        await storage.updateTask(updatedTask);
        loadData();
    };

    // Calculate efficiency (Tasks completed)
    const getUserStats = (userId: string) => {
        const userTasks = tasks.filter(t => t.userId === userId);
        const completed = userTasks.filter(t => t.status === 'COMPLETED').length;
        return { total: userTasks.length, completed };
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Worker Performance</h1>
                <Button onClick={() => setIsTaskModalOpen(true)}>Assign New Task</Button>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Worker List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Completed Tasks</TableHead>
                                    <TableHead>Efficiency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u, index) => {
                                    const stats = getUserStats(u.id);
                                    const efficiency = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                                    return (
                                        <TableRow key={u.id || index}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell>{u.role}</TableCell>
                                            <TableCell>{stats.completed}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-secondary rounded-full h-2.5 max-w-[100px]">
                                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${efficiency}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{efficiency}%</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Active Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tasks.filter(t => t.status === 'PENDING').map(t => {
                                const user = users.find(u => u.id === t.userId);
                                return (
                                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-sm text-muted-foreground">Assigned to: {user?.name}</p>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleCompleteTask(t)}>
                                            Mark Done
                                        </Button>
                                    </div>
                                )
                            })}
                            {tasks.filter(t => t.status === 'PENDING').length === 0 && <p className="text-muted-foreground">No pending tasks.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign New Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Worker</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                            >
                                <option value="">Select a worker...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Task Description</Label>
                            <Input
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="e.g. Restock Aisle 5"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Assign Task</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
