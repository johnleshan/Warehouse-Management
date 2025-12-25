'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorageSync } from '@/hooks/useStorageSync';
import { storage } from '@/lib/storage';
import { User, Task } from '@/lib/types';
import { AI } from '@/lib/ai';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Trophy, Target, Search, Filter, UserCheck, CheckCircle2 } from 'lucide-react';

export default function WorkersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Filters
    const [userFilter, setUserFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [timeFilter, setTimeFilter] = useState('all');

    // ... (rest of component code) ...

    // --- Derived Data for Charts & Tables ---
    // 1. Filter Tasks by Time
    const filteredTasks = useMemo(() => {
        if (timeFilter === 'all') return tasks;

        const now = new Date();
        const currentYear = now.getFullYear();

        return tasks.filter(t => {
            const date = new Date(t.createdAt); // Use createdAt for general activity
            const tYear = date.getFullYear();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            switch (timeFilter) {
                // Hours
                case '1h': return diffHours <= 1;
                case '3h': return diffHours <= 3;
                case '6h': return diffHours <= 6;
                case '12h': return diffHours <= 12;
                case '18h': return diffHours <= 18;
                case '24h': return diffHours <= 24;

                // Periods
                case 'week': {
                    const oneWeekAgo = new Date(now);
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return date >= oneWeekAgo;
                }
                case 'month': {
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    return date >= oneMonthAgo;
                }

                // Years / Quarters
                case 'q1': return tYear === currentYear && date.getMonth() >= 0 && date.getMonth() <= 2;
                case 'q2': return tYear === currentYear && date.getMonth() >= 3 && date.getMonth() <= 5;
                case 'q3': return tYear === currentYear && date.getMonth() >= 6 && date.getMonth() <= 8;
                case 'q4': return tYear === currentYear && date.getMonth() >= 9 && date.getMonth() <= 11;
                case 'half1': return tYear === currentYear && date.getMonth() <= 5;
                case 'half2': return tYear === currentYear && date.getMonth() >= 6;
                case 'year_curr': return tYear === currentYear;
                case 'year_2024': return tYear === 2024;
                case 'year_2023': return tYear === 2023;

                default: return true;
            }
        });
    }, [tasks, timeFilter]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesUser = userFilter === 'ALL' || u.id === userFilter;
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesUser && matchesRole;
        });
    }, [users, userFilter, roleFilter]);

    const userStats = useMemo(() => {
        return filteredUsers.map(u => {
            // Use filteredTasks instead of all tasks
            const userTasks = filteredTasks.filter(t => t.userId === u.id);
            const completed = userTasks.filter(t => t.status === 'COMPLETED').length;
            const pending = userTasks.length - completed;
            const efficiency = AI.calculateUserEfficiency(u, filteredTasks); // Uses shared logic
            return {
                ...u,
                totalTasks: userTasks.length,
                completed,
                pending,
                efficiency
            };
        }).sort((a, b) => b.efficiency - a.efficiency); // Rank by efficiency
    }, [filteredUsers, filteredTasks]);

    // ... (rest of chart data logic) ...

    // Update chart data sources to use filteredTasks length
    const taskDistributionData = [
        { name: 'Completed', value: filteredTasks.filter(t => t.status === 'COMPLETED').length, color: '#10b981' },
        { name: 'Pending', value: filteredTasks.filter(t => t.status === 'PENDING').length, color: '#f59e0b' },
    ];

    // ... (inside JSX) ...

    {/* Filters */ }
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border border-muted">
                {/* ... existing filters ... */}
                
                 <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="1h">Last 1 Hour</SelectItem>
                        <SelectItem value="3h">Last 3 Hours</SelectItem>
                        <SelectItem value="6h">Last 6 Hours</SelectItem>
                        <SelectItem value="12h">Last 12 Hours</SelectItem>
                        <SelectItem value="18h">Last 18 Hours</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                        <div className="border-t my-1" />
                        <SelectItem value="year_curr">Current Year</SelectItem>
                        <SelectItem value="year_2024">2024</SelectItem>
                    </SelectContent>
                </Select>
                {/* ... Reset button ... */}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Chart: Efficiency Matrix */}
                <Card className="lg:col-span-2 premium-card">
                   {/* ... same ... */}
                </Card>

                {/* Chart: Task Status (Updated Layout) */}
                <Card className="premium-card flex flex-col">
                    <CardHeader>
                        <CardTitle>Workload Status</CardTitle>
                        <CardDescription>Global task completion ratio.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-0 pb-6 relative">
                         <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 0 }} />
                                </PieChart>
                            </ResponsiveContainer>
                         </div>
                        
                        {/* Static Center Label - Positioned absolutely to ensure it stays in the middle */ }
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                             <div className="text-center bg-background/50 backdrop-blur-sm p-2 rounded-full">
                                <span className="text-3xl font-black">{filteredTasks.length}</span>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

    {/* User List Table */ }
    <Card className="premium-card">
        <CardHeader>
            <CardTitle>Personnel Roster</CardTitle>
            <CardDescription>Individual performance statistics.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Tasks Done</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Efficiency</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userStats.map((u, index) => (
                        <TableRow key={u.id} className="group hover:bg-muted/50">
                            <TableCell className="font-bold text-muted-foreground">#{index + 1}</TableCell>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {u.name[0]}
                                    </div>
                                    {u.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                                    {u.role}
                                </span>
                            </TableCell>
                            <TableCell>{u.completed}</TableCell>
                            <TableCell>
                                {u.pending > 0 ? (
                                    <span className="text-amber-600 font-bold">{u.pending}</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs opacity-50">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${u.efficiency >= 80 ? 'bg-green-500' : u.efficiency >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(u.efficiency, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold">{u.efficiency}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>

    {/* Active Tasks List - Always useful to have nearby */ }
            <Card>
                <CardHeader>
                    <CardTitle>Pending Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.filter(t => t.status === 'PENDING').map(t => {
                            const user = users.find(u => u.id === t.userId);
                            // Filter this list too based on overall filters? Usually better to show all pending unless specific user is selected
                            if (userFilter !== 'ALL' && user?.id !== userFilter) return null;

                            return (
                                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div>
                                        <p className="font-medium">{t.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <UserCheck className="h-3 w-3" />
                                            <span>{user?.name || 'Unassigned'}</span>
                                            <span className="text-xs">• {new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleCompleteTask(t)} className="h-8">
                                        Mark Done
                                    </Button>
                                </div>
                            )
                        })}
                        {tasks.filter(t => t.status === 'PENDING').length === 0 && <p className="text-muted-foreground text-center py-4">No pending tasks.</p>}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign New Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Team Member</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                            >
                                <option value="">Select a user...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Task Description</Label>
                            <Input
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="e.g. Audit Aisle C, Prepare Order #504"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Assign Task</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
}
