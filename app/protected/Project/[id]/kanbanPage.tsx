"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Pencil } from "lucide-react";

type Task = { id: number; text: string; done: boolean };
type Column = { title: string; tasks: Task[] };

export default function KanbanPage() {
  const [columns, setColumns] = useState<Record<string, Column>>({
    todo: {
      title: "To Do",
      tasks: [{ id: 1, text: "Belajar Next.js", done: false }],
    },
    progress: {
      title: "In Progress",
      tasks: [{ id: 2, text: "Bikin UI Kanban", done: false }],
    },
    done: {
      title: "Done",
      tasks: [{ id: 3, text: "Setup Project", done: true }],
    },
  });

  const [newTask, setNewTask] = useState<Record<string, string>>({});
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  // ➕ Tambah Task
  const addTask = (colKey: string) => {
    if (!newTask[colKey]?.trim()) return;

    const newItem: Task = {
      id: Date.now(),
      text: newTask[colKey],
      done: false,
    };

    setColumns({
      ...columns,
      [colKey]: {
        ...columns[colKey],
        tasks: [...columns[colKey].tasks, newItem],
      },
    });

    setNewTask({ ...newTask, [colKey]: "" });
  };

  // ✅ Toggle Task
  const toggleTask = (colKey: string, id: number) => {
    setColumns({
      ...columns,
      [colKey]: {
        ...columns[colKey],
        tasks: columns[colKey].tasks.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task
        ),
      },
    });
  };

  // 🗑️ Hapus Task
  const deleteTask = (colKey: string, id: number) => {
    setColumns({
      ...columns,
      [colKey]: {
        ...columns[colKey],
        tasks: columns[colKey].tasks.filter((task) => task.id !== id),
      },
    });
  };

  // ➕ Tambah Board
  const addBoard = () => {
    const newKey = `board-${Date.now()}`;
    setColumns({
      ...columns,
      [newKey]: { title: "New Board", tasks: [] },
    });
  };

  // 📝 Update Judul Board
  const updateBoardTitle = (colKey: string, newTitle: string) => {
    setColumns({
      ...columns,
      [colKey]: {
        ...columns[colKey],
        title: newTitle,
      },
    });
  };

  // 🗑️ Hapus Board
  const deleteBoard = (colKey: string) => {
    const updated = { ...columns };
    delete updated[colKey];
    setColumns(updated);
  };

  // 🧩 Fungsi Drag & Drop
  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceTasks = [...sourceCol.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Pindah di kolom yang sama
      sourceTasks.splice(destination.index, 0, movedTask);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          tasks: sourceTasks,
        },
      });
    } else {
      // Pindah ke kolom lain
      const destTasks = [...destCol.tasks];
      destTasks.splice(destination.index, 0, movedTask);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, tasks: sourceTasks },
        [destination.droppableId]: { ...destCol, tasks: destTasks },
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🚀 My Kanban Board</h1>
        <Button variant="outline" onClick={addBoard}>
          + New Board
        </Button>
      </header>

      {/* DragDropContext */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(columns).map(([colKey, colData]) => (
            <Droppable droppableId={colKey} key={colKey}>
              {(provided) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    {editingTitle === colKey ? (
                      <Input
                        value={colData.title}
                        onChange={(e) => updateBoardTitle(colKey, e.target.value)}
                        onBlur={() => setEditingTitle(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingTitle(null);
                        }}
                        autoFocus
                        className="text-lg font-semibold border border-gray-400 bg-white px-2 py-1"
                      />
                    ) : (
                      <h2
                        className={`text-lg font-semibold ${
                          colKey === "todo"
                            ? "text-blue-600"
                            : colKey === "progress"
                            ? "text-yellow-600"
                            : colKey === "done"
                            ? "text-green-600"
                            : "text-black"
                        }`}
                      >
                        {colData.title}
                      </h2>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setEditingTitle(editingTitle === colKey ? null : colKey)
                        }
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBoard(colKey)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Daftar Task */}
                  <CardContent className="space-y-2">
                    {colData.tasks.map((task, index) => (
                      <Draggable
                        key={task.id.toString()}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between bg-white p-2 rounded shadow"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={task.done}
                                onCheckedChange={() =>
                                  toggleTask(colKey, task.id)
                                }
                              />
                              <span
                                className={`transition-all ${
                                  task.done
                                    ? "line-through text-gray-400 italic"
                                    : "text-gray-800 font-medium"
                                }`}
                              >
                                {task.text}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTask(colKey, task.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </CardContent>

                  {/* Input tambah task */}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder={`Add to ${colData.title}`}
                      value={newTask[colKey] || ""}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          [colKey]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(colKey);
                      }}
                    />
                    <Button onClick={() => addTask(colKey)}>+</Button>
                  </div>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
