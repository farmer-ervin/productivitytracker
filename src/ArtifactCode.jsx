import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Clock, Paperclip, Edit, GripHorizontal, Plus, X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Utility functions
const formatTime = (time) => {
  const hours = String(time.hours).padStart(2, '0');
  const minutes = String(time.minutes).padStart(2, '0');
  const seconds = String(time.seconds).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatTimeEstimate = (estimate) => {
  if (!estimate || (estimate.hours === 0 && estimate.minutes === 0)) return '0min';
  const parts = [];
  if (estimate.hours > 0) parts.push(`${estimate.hours}h`);
  if (estimate.minutes > 0) parts.push(`${estimate.minutes}min`);
  return parts.join(' ');
};

// TaskDialog Component
const TaskDialog = ({ isOpen, onClose, onSubmit, onDelete, initialData, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hours: 0,
    minutes: 0,
    notes: ''
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        hours: initialData.timeEstimate?.hours || 0,
        minutes: initialData.timeEstimate?.minutes || 0,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        hours: 0,
        minutes: 0,
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    const taskData = {
      ...(initialData || {}), // Preserve existing task data like ID
      title: formData.title,
      description: formData.description,
      timeEstimate: {
        hours: parseInt(formData.hours) || 0,
        minutes: parseInt(formData.minutes) || 0
      },
      notes: formData.notes
    };
    console.log('Submitting task data:', taskData);
    onSubmit(taskData);
    onClose();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(initialData.id);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">
              {mode === 'edit' ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task description"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-100">Hours</label>
                <Input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  min="0"
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-100">Minutes</label>
                <Input
                  type="number"
                  name="minutes"
                  value={formData.minutes}
                  onChange={handleChange}
                  min="0"
                  max="59"
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">Notes</label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <Button
              type="submit" 
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              onClick={(e) => {
                e.preventDefault();
                console.log('Submitting with data:', formData);
                handleSubmit(e);
              }}
            >
              {mode === 'edit' ? 'Update Task' : 'Create Task'}
            </Button>
            
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive" 
                onClick={handleDelete}
                className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Task
              </Button>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskCard = React.memo(
  ({
    task,
    onEdit,
    onDragStart,
    onSelect,
    isSelected,
    isDragged,
    onCheckboxChange,
  }) => {
    const formattedTime = useMemo(
      () => formatTimeEstimate(task.timeEstimate),
      [task.timeEstimate]
    );

    const handleEditTask = useCallback(() => {
      onEdit(task);
    }, [task, onEdit]);

    return (
      <div
        draggable
        onDragStart={onDragStart}
        onClick={onSelect}
        className={`p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700/50 cursor-pointer ${
          isDragged ? 'opacity-50' : ''
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-start gap-2">
          <GripHorizontal className="h-4 w-4 text-zinc-500 mt-1 flex-shrink-0 cursor-move" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-zinc-100 truncate">{task.title}</h3>
              <button
                className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTask();
                }}
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
            {task.description && (
              <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedTime}
              </span>
              {task.attachments?.length > 0 && (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments.length}
                </span>
              )}
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={(e) => {
                  e.stopPropagation();
                  onCheckboxChange(task, e.target.checked);
                }}
                className="ml-auto"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const KanbanColumn = React.memo(
  ({
    list,
    getListStats,
    onDragOver,
    onDrop,
    onTaskDragStart,
    onTaskSelect,
    selectedTaskId,
    draggedTaskId,
    onAddTask,
    onEditTask,
    onTaskStatusChange
  }) => {
    const stats = useMemo(() => getListStats(list.id), [getListStats, list.id]);
    
    const handleDragOver = useCallback(
      (e) => {
        e.preventDefault();
        onDragOver(list.id);
      },
      [list.id, onDragOver]
    );

    const handleDrop = useCallback(
      (e) => {
        e.preventDefault();
        onDrop(list.id);
      },
      [list.id, onDrop]
    );

    return (
      <div
        className="flex flex-col gap-3 min-w-[300px] w-[300px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-zinc-100">{list.title}</h2>
            <p className="text-sm text-zinc-400">
              {stats.total} {stats.total === 1 ? 'task' : 'tasks'} •{' '}
              {formatTimeEstimate(stats.totalTime)}
            </p>
          </div>
          <button
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
            onClick={() => onAddTask(list.id)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {list.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDragStart={() => onTaskDragStart(task.id)}
              onSelect={() => onTaskSelect(task.id)}
              isSelected={selectedTaskId === task.id}
              isDragged={draggedTaskId === task.id}
              onCheckboxChange={(task, checked) =>
                onTaskStatusChange(task.id, checked ? 'done' : 'todo')
              }
            />
          ))}
        </div>
      </div>
    );
  }
);

// Demo data
const initialLists = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      {
        id: '1',
        title: 'Design new landing page',
        description: 'Create wireframes and mockups for the homepage redesign',
        timeEstimate: { hours: 4, minutes: 30 },
        status: 'backlog',
        attachments: [1, 2]
      },
      {
        id: '2',
        title: 'Fix navigation bug',
        description: 'Mobile menu not closing on item selection',
        timeEstimate: { hours: 1, minutes: 0 },
        status: 'backlog',
        attachments: []
      }
    ]
  },
  {
    id: 'thisWeek',
    title: 'This Week',
    tasks: [
      {
        id: '3',
        title: 'Write documentation',
        description: 'Document the new API endpoints',
        timeEstimate: { hours: 2, minutes: 0 },
        status: 'thisWeek',
        attachments: [1]
      }
    ]
  },
  {
    id: 'today',
    title: 'Today',
    tasks: [
      {
        id: '4',
        title: 'Update dependencies',
        description: 'Update all npm packages to latest versions',
        timeEstimate: { hours: 0, minutes: 45 },
        status: 'today',
        attachments: []
      }
    ]
  }
];

// Timer Component
const PomodoroTimer = ({ selectedTask, lists }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  // Reset timer when selected task changes
  useEffect(() => {
    if (!selectedTask) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      setIsActive(false);
      return;
    }

    // Find the task in lists
    const task = lists.flatMap(list => list.tasks)
                     .find(t => t.id === selectedTask);
    
    if (task) {
      setTimeLeft({
        hours: task.timeEstimate.hours,
        minutes: task.timeEstimate.minutes,
        seconds: 0
      });
      setIsActive(false);
    }
  }, [selectedTask, lists]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
            setIsActive(false);
            clearInterval(intervalRef.current);
            return prev;
          }

          let newSeconds = prev.seconds - 1;
          let newMinutes = prev.minutes;
          let newHours = prev.hours;

          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes -= 1;
          }

          if (newMinutes < 0) {
            newMinutes = 59;
            newHours -= 1;
          }

          return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (!selectedTask) return;
    
    const task = lists.flatMap(list => list.tasks)
                     .find(t => t.id === selectedTask);
    
    if (task) {
      setTimeLeft({
        hours: task.timeEstimate.hours,
        minutes: task.timeEstimate.minutes,
        seconds: 0
      });
      setIsActive(false);
    }
  };

  // Format time as HH:MM:SS
  const formattedTime = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono text-zinc-100">{formattedTime}</div>
          <div className="flex gap-2">
            <Button
              onClick={toggleTimer}
              className={`${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button
              onClick={resetTimer}
              className="bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              Reset
            </Button>
          </div>
        </div>
        {selectedTask && (
          <div className="text-zinc-400">
            Selected Task: {lists.flatMap(list => list.tasks).find(t => t.id === selectedTask)?.title}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Kanban Board Component
const KanbanBoard = () => {
  const [lists, setLists] = useState(initialLists);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragTargetListId, setDragTargetListId] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const getListStats = useCallback((listId) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return { total: 0, totalTime: { hours: 0, minutes: 0 } };

    const total = list.tasks.length;
    const totalTime = list.tasks.reduce((acc, task) => {
      return {
        hours: acc.hours + task.timeEstimate.hours,
        minutes: acc.minutes + task.timeEstimate.minutes
      };
    }, { hours: 0, minutes: 0 });

    // Normalize minutes
    totalTime.hours += Math.floor(totalTime.minutes / 60);
    totalTime.minutes = totalTime.minutes % 60;

    return { total, totalTime };
  }, [lists]);

  const handleAddTask = useCallback((listId) => {
    console.log('Adding task to list:', listId);
    setActiveListId(listId);
    setIsTaskDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  }, []);

  const handleCreateTask = useCallback((taskData) => {
    console.log('Creating task with data:', taskData);
    console.log('Active list ID:', activeListId);

    if (!activeListId) {
      console.error('No active list ID');
      return;
    }
    
    const newTask = {
      id: String(Date.now()),
      title: taskData.title,
      description: taskData.description,
      timeEstimate: taskData.timeEstimate,
      status: activeListId,
      attachments: [],
      notes: taskData.notes
    };

    console.log('New task:', newTask);

    setLists(prevLists => {
      const updatedLists = prevLists.map(list => {
        if (list.id === activeListId) {
          console.log('Adding to list:', list.title);
          return {
            ...list,
            tasks: [...list.tasks, newTask]
          };
        }
        return list;
      });
      console.log('Updated lists:', updatedLists);
      return updatedLists;
    });
    
    setIsTaskDialogOpen(false);
    setActiveListId(null);
  }, [activeListId]);
  
  const handleUpdateTask = useCallback((updatedTask) => {
    setLists(prevLists => 
      prevLists.map(list => ({
        ...list,
        tasks: list.tasks.map(task => 
          task.id === updatedTask.id ? {...task, ...updatedTask } : task
        )
      }))
    );

    setIsTaskDialogOpen(false);
    setEditingTask(null);
  }, []);

  const handleDeleteTask = useCallback((taskId) => {
    setLists(prevLists => 
      prevLists.map(list => ({
        ...list, 
        tasks: list.tasks.filter(task => task.id !== taskId)
      }))  
    );
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  }, []);

  const handleDragStart = useCallback((taskId) => {
    setDraggedTaskId(taskId);
  }, []);

  const handleDragOver = useCallback((listId) => {
    setDragTargetListId(listId);
  }, []);

  const handleDrop = useCallback((targetListId) => {
    if (!draggedTaskId || !targetListId) return;

    setLists(prevLists => {
      // Find the task and remove it from its current list
      let task;
      const sourceList = prevLists.find(list => 
        list.tasks.some(t => {
          if (t.id === draggedTaskId) {
            task = t;
            return true;
          }
          return false;
        })
      );

      if (!sourceList || !task) return prevLists;

      // Create new lists with the task moved
      return prevLists.map(list => {
        if (list.id === sourceList.id) {
          return {
            ...list,
            tasks: list.tasks.filter(t => t.id !== draggedTaskId)
          };
        }
        if (list.id === targetListId) {
          return {
            ...list,
            tasks: [...list.tasks, { ...task, status: targetListId }]
          };
        }
        return list;
      });
    });

    setDraggedTaskId(null);
    setDragTargetListId(null);
  }, [draggedTaskId]);

  const handleTaskStatusChange = useCallback((taskId, newStatus) => {
    setLists(prevLists =>
      prevLists.map(list => ({
        ...list,
        tasks: list.tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      }))
    );
  }, []);

  return (
    <div className="p-6 bg-zinc-900 min-h-screen pb-24">
      <div className="flex gap-6 overflow-x-auto pb-6">
        {lists.map(list => (
          <KanbanColumn
            key={list.id}
            list={list}
            getListStats={getListStats}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTaskDragStart={handleDragStart}
            onTaskSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            draggedTaskId={draggedTaskId}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onTaskStatusChange={handleTaskStatusChange}
          />
        ))}
      </div>

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setActiveListId(null);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onDelete={handleDeleteTask}
        initialData={editingTask} 
        mode={editingTask ? 'edit' : 'create'}
      />

      <PomodoroTimer 
        selectedTask={selectedTaskId}
        lists={lists}
      />
    </div>
  );
};

export default KanbanBoard;
