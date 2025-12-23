'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStorageSync } from '@/hooks/useStorageSync';
import { storage } from '@/lib/storage';
import { Worker, Task } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // New Task Form
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const loadData = useCallback(async () => {
        await storage.init();
        const [w, t] = await Promise.all([
            storage.getWorkers(),
            storage.getTasks()
        ]);
        setWorkers(w);
        setTasks(t);
    }, []);

    useStorageSync(loadData);

    useEffect(() => {
        if (typeof window !== 'undefined') loadData();
    }, [loadData]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkerId || !taskDescription) return;

        const newTask: Task = {
            id: generateId(),
            workerId: selectedWorkerId,
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
    const getWorkerStats = (workerId: string) => {
        const workerTasks = tasks.filter(t => t.workerId === workerId);
        const completed = workerTasks.filter(t => t.status === 'COMPLETED').length;
        return { total: workerTasks.length, completed };
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Worker Performance</h1>
                <Button onClick={() => setIsTaskModalOpen(true)}>Assign New Task</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                                {workers.map((w, index) => {
                                    const stats = getWorkerStats(w.id);
                                    const efficiency = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                                    return (
                                        <TableRow key={w.id || index}>
                                            <TableCell className="font-medium">{w.name}</TableCell>
                                            <TableCell>{w.role}</TableCell>
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
                                const worker = workers.find(w => w.id === t.workerId);
                                return (
                                    <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-sm text-muted-foreground">Assigned to: {worker?.name}</p>
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
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                required
                            >
                                <option value="">Select a worker...</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
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
