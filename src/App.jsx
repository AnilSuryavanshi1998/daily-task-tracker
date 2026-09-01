import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TaskTracker() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("None");
  const [dragIndex, setDragIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) setTasks(JSON.parse(storedTasks));

    const storedTheme = localStorage.getItem("darkMode");
    if (storedTheme) setDarkMode(storedTheme === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = { text: task, completed: false, priority, dueDate };
    setTasks([...tasks, newTask]);
    setTask("");
    setPriority("Medium");
    setDueDate("");
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleComplete = (index) => {
    const newTasks = tasks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(tasks[index].text);
    setEditPriority(tasks[index].priority);
    setEditDueDate(tasks[index].dueDate || "");
  };

  const saveEdit = (index) => {
    const newTasks = tasks.map((t, i) =>
      i === index
        ? { ...t, text: editText, priority: editPriority, dueDate: editDueDate }
        : t
    );
    setTasks(newTasks);
    setEditIndex(null);
    setEditText("");
    setEditPriority("Medium");
    setEditDueDate("");
  };

  const clearAll = () => setTasks([]);

  const priorityColor = (p) => {
    switch (p) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-600";
    }
  };

  const isOverdue = (t) => {
    if (!t.dueDate || t.completed) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const taskDate = new Date(t.dueDate).setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  const displayedTasks = tasks
    .filter((t) => {
      const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Completed"
          ? t.completed
          : !t.completed;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sort === "Priority") {
        const order = { High: 1, Medium: 2, Low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

  // Drag & Drop Handlers
  const handleDragStart = (index) => setDragIndex(index);

  const handleDragEnter = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const newTasks = [...tasks];
    const draggedTask = newTasks[dragIndex];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(index, 0, draggedTask);
    setDragIndex(index);
    setTasks(newTasks);
  };

  const handleDragEnd = () => setDragIndex(null);

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">📝 Daily Task Tracker</h1>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-4 px-4 py-2 rounded border"
      >
        {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </button>

      {/* Input Section */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter a task"
          value={editIndex !== null ? editText : task}
          onChange={(e) =>
            editIndex !== null ? setEditText(e.target.value) : setTask(e.target.value)
          }
          className={`border p-2 rounded w-48 ${
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        />
        <select
          value={editIndex !== null ? editPriority : priority}
          onChange={(e) =>
            editIndex !== null ? setEditPriority(e.target.value) : setPriority(e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input
          type="date"
          value={editIndex !== null ? editDueDate : dueDate}
          onChange={(e) =>
            editIndex !== null ? setEditDueDate(e.target.value) : setDueDate(e.target.value)
          }
          className="border p-2 rounded"
        />
        <button
          onClick={() => (editIndex !== null ? saveEdit(editIndex) : addTask())}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editIndex !== null ? "Save" : "Add Task"}
        </button>
        <button
          onClick={clearAll}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear All
        </button>
      </div>

      {/* Filter + Sort + Search */}
      <div className="flex gap-2 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="All">All</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="None">No Sort</option>
          <option value="Priority">Sort by Priority</option>
        </select>

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-40"
        />
      </div>
       
       {/* Progress Bar with Percentage */}
<div className="w-full bg-gray-300 rounded mt-2 h-6 relative">
  <div
    className="h-6 bg-green-500 rounded"
    style={{
      width: `${
        tasks.length ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0
      }%`,
    }}
  ></div>
  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 text-sm font-bold text-black dark:text-white">
    {tasks.length
      ? `${Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)}% Completed`
      : "0% Completed"}
  </span>
</div>

    

      {/* Task List */}
      <ul className="space-y-2 w-96 mt-4">
      <AnimatePresence>
    {displayedTasks.map((t, index) => (
     <motion.li
  key={index}
  draggable
  onDragStart={() => handleDragStart(tasks.indexOf(t))}
  onDragEnter={() => handleDragEnter(tasks.indexOf(t))}
  onDragEnd={handleDragEnd}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.02 }}
  className={`flex justify-between items-center border p-2 rounded cursor-move ${
    isOverdue(t)
      ? "bg-red-100"
      : darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-300"
  }`}
          >
            <span
              onClick={() => toggleComplete(tasks.indexOf(t))}
              className={`cursor-pointer ${
                t.completed ? "line-through text-gray-400" : ""
              } ${priorityColor(t.priority)}`}
            >
              {t.text} ({t.priority}) {t.dueDate && `- Due: ${t.dueDate}`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(tasks.indexOf(t))}
                className="text-green-500 font-bold"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => deleteTask(tasks.indexOf(t))}
                className="text-red-500 font-bold"
              >
                ❌ Delete
              </button>
            </div>
          </motion.li>
        ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default TaskTracker;
















