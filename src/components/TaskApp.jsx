import { useMemo, useState } from "react";
import { ArrowDownUp, ArrowRight, Check, CheckCheck, Circle, CircleCheck, Clock3, LogOut, Plus, Search, Sparkles, Sun, Trash2, X } from "lucide-react";
import { formatDate, parseDateValue, toDateKey, today, tomorrow } from "../lib/taskUtils.js";
import { useTasks } from "../hooks/useTasks.js";

function BoardSelector({ boards, boardId, onSelect, onCreate }) {
  return (
    <div className="board-panel">
      <div className="board-panel-header">
        <button
          type="button"
          className="board-new"
          onClick={() => {
            const nextName = window.prompt("Name des Boards", "Mein Board");
            if (nextName && nextName.trim()) {
              onCreate(nextName.trim());
            }
          }}
        >
          + Neues Board
        </button>
      </div>
      <select
        className="board-select"
        value={boardId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        aria-label="Board auswählen"
      >
        {boards.length > 0 ? (
          boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name || board.title || "Unbenanntes Board"}
            </option>
          ))
        ) : (
          <option value="">Noch keine Boards</option>
        )}
      </select>
    </div>
  );
}

function NavItem({ icon: Icon, label, count, selected, onClick }) {
  return (
    <button className={`nav-item ${selected ? "selected" : ""}`} onClick={onClick}>
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
      <span className="nav-count">{count}</span>
    </button>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const isDone = task.status === "done";

  return (
    <article className={`task-row ${isDone ? "is-complete" : ""}`}>
      <button
        className={`task-check ${isDone ? "checked" : ""}`}
        onClick={() => onToggle(task)}
        aria-label={isDone ? `${task.title} als offen markieren` : `${task.title} als erledigt markieren`}
      >
        {isDone ? <Check size={14} strokeWidth={2.5} /> : <Circle size={21} strokeWidth={1.5} />}
      </button>
      <span className="task-title">{task.title}</span>
      <span className={`priority-label ${task.priority || "medium"}`}>
        <span className="priority-dot" />
        {task.priority === "high" ? "Hoch" : task.priority === "low" ? "Niedrig" : "Mittel"}
      </span>
      <span className="task-due">
        {(() => {
          const parsedDueDate = parseDateValue(task.due_date);

          if (!parsedDueDate) return "Kein Datum";

          const dueKey = toDateKey(parsedDueDate);

          if (dueKey === today) return "Heute";
          if (dueKey === tomorrow) return "Morgen";

          return parsedDueDate.toLocaleDateString("de-DE", {
            month: "short",
            day: "numeric",
          });
        })()}
      </span>
      <button className="delete-task" aria-label={`${task.title} löschen`} onClick={() => onDelete(task)}>
        <Trash2 size={16} />
      </button>
    </article>
  );
}

function TaskList({ visibleTasks, filter, query, view, onToggle, onDelete, onAddFirst }) {
  const groupedVisibleTasks =
    view === "upcoming"
      ? [
          { label: "Schwebend", tasks: visibleTasks.filter((task) => !task.due_date) },
          { label: "Geplant", tasks: visibleTasks.filter((task) => task.due_date) },
        ].filter((group) => group.tasks.length > 0)
      : null;

  if (visibleTasks.length > 0 && groupedVisibleTasks) {
    return (
      <div className="task-list" aria-live="polite">
        {groupedVisibleTasks.map((group) => (
          <div className="task-group" key={group.label}>
            <div className="task-group-header">{group.label}</div>
            {group.tasks.map((task, index) => (
              <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} style={{ "--row-index": index }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (visibleTasks.length > 0) {
    return (
      <div className="task-list" aria-live="polite">
        {visibleTasks.map((task, index) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} style={{ "--row-index": index }} />
        ))}
      </div>
    );
  }

  return (
    <div className="task-list" aria-live="polite">
      <div className="empty-state">
        <div className="empty-mark">
          <Sparkles size={22} />
        </div>
        <h2>
          {query
            ? "Nichts gefunden"
            : filter === "done"
              ? "Der nächste kleine Erfolg ist da."
              : view === "upcoming"
                ? "Nichts in Sicht."
                : "Ein wenig Freiraum."}
        </h2>
        <p>
          {query
            ? "Versuche eine andere Suche oder lösche das Feld."
            : filter === "done"
              ? "Erledigte Aufgaben landen hier."
              : view === "upcoming"
                ? "Aufgaben, die du später planst, erscheinen hier."
                : "Füge eine Aufgabe hinzu und mach dir heute Platz."}
        </p>
        {!query && (
          <button onClick={onAddFirst}>
            Erste Aufgabe hinzufügen <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function Sidebar({ user, onLogout, navItems, view, setView, setFilter, progress, doneToday, connection, boards, boardId, onSelectBoard, onCreateBoard }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#today" onClick={() => setView("today")}>
        <span className="brand-mark">
          <CircleCheck size={21} strokeWidth={2.4} />
        </span>
        <span>
          daymark<span className="brand-period">.</span>
        </span>
      </a>

      <div className="workspace-label">DEIN BEREICH</div>

      <BoardSelector boards={boards} boardId={boardId} onSelect={onSelectBoard} onCreate={onCreateBoard} />

      <nav className="main-nav" aria-label="Aufgabenansichten">
        {navItems.map(({ id, label, icon: Icon, count }) => (
          <NavItem
            key={id}
            icon={Icon}
            label={label}
            count={count}
            selected={view === id}
            onClick={() => {
              setView(id);
              setFilter(id === "completed" ? "done" : "all");
            }}
          />
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="progress-card">
          <div className="progress-top">
            <span>Täglicher Fortschritt</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            {doneToday === 0
              ? "Ein sauberer Start, nur für dich."
              : `${doneToday} ${doneToday === 1 ? "Sache" : "Sachen"} weniger im Kopf.`}
          </p>
        </div>

        <div className="connection-state">
          <span className={`connection-dot ${connection}`} />
          <span>
            {connection === "cloud"
              ? "Mit Supabase synchronisiert"
              : connection === "connecting"
                ? "Verbinden…"
                : connection === "offline"
                  ? "Offline · lokal gespeichert"
                  : "Auf diesem Gerät gespeichert"}
          </span>
        </div>

        <div className="profile-row">
          <div className="avatar">
            {(user.user_metadata?.username || user.email || "D").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.user_metadata?.username || user.email}</strong>
            <span>{user.email}</span>
          </div>
          <button className="icon-button profile-more" aria-label="Abmelden" title="Abmelden" onClick={onLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TaskApp({ user, onLogout }) {
  const {
    tasks,
    boards,
    boardId,
    connection,
    addTask,
    toggleTask,
    deleteTask,
    selectBoard,
    createBoard,
  } = useTasks(user.id);

  const [view, setView] = useState("today");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDatePreset, setDueDatePreset] = useState(today);
  const [customDueDate, setCustomDueDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isTaskDone = (task) => task.status === "done";

  const activeTasks = tasks.filter((task) => !isTaskDone(task));
  const todayTasks = tasks.filter((task) => {
    const taskDueKey = task.due_date ? toDateKey(task.due_date) : null;
    return Boolean(taskDueKey) && taskDueKey <= today;
  });
  const todayOpenTasks = todayTasks.filter((task) => !isTaskDone(task));
  const upcomingTasks = activeTasks.filter((task) => {
    const taskDueKey = task.due_date ? toDateKey(task.due_date) : null;
    return !taskDueKey || taskDueKey > today;
  });
  const completedTasks = tasks.filter((task) => isTaskDone(task));

  const scopedTasks =
    view === "upcoming"
      ? upcomingTasks
      : view === "completed"
        ? completedTasks
        : view === "all"
          ? tasks
          : todayTasks;

  const visibleTasks = useMemo(
    () =>
      scopedTasks
        .filter(
          (task) =>
            filter === "all" ||
            (filter === "open" ? !isTaskDone(task) : isTaskDone(task)),
        )
        .filter((task) => task.title.toLowerCase().includes(query.toLowerCase()))
        .sort(
          (a, b) =>
            Number(isTaskDone(a)) - Number(isTaskDone(b)) ||
            ["high", "medium", "low"].indexOf(a.priority) -
              ["high", "medium", "low"].indexOf(b.priority),
        ),
    [scopedTasks, filter, query],
  );

  const navItems = [
    { id: "today", label: "Heute", icon: Sun, count: todayOpenTasks.length },
    { id: "upcoming", label: "Geplant", icon: Clock3, count: upcomingTasks.length },
    { id: "all", label: "Alle Aufgaben", icon: CircleCheck, count: activeTasks.length },
    { id: "completed", label: "Erledigt", icon: CheckCheck, count: completedTasks.length },
  ];

  const heading =
    view === "upcoming"
      ? "Geplant"
      : view === "completed"
        ? "Gut gemacht"
        : view === "all"
          ? "Alle deine Aufgaben"
          : "Heute im Fokus";

  const subheading =
    view === "upcoming"
      ? "Ein kurzer Blick auf das, was noch vor dir liegt."
      : view === "completed"
        ? "Jeder kleine Abschluss hat dich hierhin gebracht."
        : view === "all"
          ? "Alles auf einen Blick, alles an einem Ort."
          : "Mach ein bisschen Fortschritt und lass den Rest warten.";

  const doneToday = todayTasks.filter((task) => isTaskDone(task)).length;
  const progress = todayTasks.length === 0 ? 0 : Math.round((doneToday / todayTasks.length) * 100);

  async function handleAddTask(event) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    const nextDueDate = dueDatePreset === "custom" ? customDueDate : dueDatePreset === "" ? "" : dueDatePreset;

    await addTask({ title, priority, due_date: nextDueDate || null });
    setTaskTitle("");
    setPriority("medium");
    setDueDatePreset(today);
    setCustomDueDate("");
    setIsAdding(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        onLogout={onLogout}
        navItems={navItems}
        view={view}
        setView={setView}
        setFilter={setFilter}
        progress={progress}
        doneToday={doneToday}
        connection={connection}
        boards={boards}
        boardId={boardId}
        onSelectBoard={selectBoard}
        onCreateBoard={createBoard}
      />

      <main className="main-content">
        <header className="topbar">
          <div className="date-label">
            <span className="date-dot" />
            {formatDate(new Date())}
          </div>
          <div className="top-actions">
            {isSearching ? (
              <label className="search-field">
                <Search size={16} />
                <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Aufgabe suchen…" />
                <button
                  aria-label="Suche schließen"
                  onClick={() => {
                    setIsSearching(false);
                    setQuery("");
                  }}
                >
                  <X size={15} />
                </button>
              </label>
            ) : (
              <button className="icon-button search-toggle" aria-label="Aufgaben suchen" onClick={() => setIsSearching(true)}>
                <Search size={18} />
              </button>
            )}
            <span className="top-divider" />
            <span className={`sync-label ${connection}`}>
              <span className={`connection-dot ${connection}`} />
              {connection === "cloud"
                ? "Alle Änderungen gespeichert"
                : connection === "connecting"
                  ? "Verbinden"
                  : connection === "offline"
                    ? "Offline arbeiten"
                    : "Lokaler Bereich"}
            </span>
          </div>
        </header>

        <section className="content-wrap">
          <div className="intro-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />EIN GUTER TAG STARTET KLEIN
              </div>
              <h1>
                {heading}
                <span className="heading-period">.</span>
              </h1>
              <p className="intro-copy">{subheading}</p>
            </div>
            <div className="date-stamp">
              <span>{new Intl.DateTimeFormat("de-DE", { month: "short" }).format(new Date()).toUpperCase()}</span>
              <strong>{new Date().getDate()}</strong>
            </div>
          </div>

          <form className={`quick-add ${isAdding ? "expanded" : ""}`} onSubmit={handleAddTask}>
            <button type="button" className="add-symbol" aria-label="Aufgabe hinzufügen" onClick={() => setIsAdding(true)}>
              <Plus size={19} />
            </button>
            <input
              value={taskTitle}
              onFocus={() => setIsAdding(true)}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Füge etwas zu deinem Tag hinzu…"
              aria-label="Titel der neuen Aufgabe"
            />

            {isAdding && (
              <div className="add-options">
                <label className="select-wrap">
                  <span className={`priority-dot ${priority}`} />
                  <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priorität">
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                  </select>
                  <ArrowDownUp size={13} />
                </label>
                <label className="date-select">
                  <Clock3 size={14} />
                  <select
                    value={dueDatePreset}
                    onChange={(event) => setDueDatePreset(event.target.value)}
                    aria-label="Fälligkeitsdatum"
                  >
                    <option value={today}>Heute</option>
                    <option value={tomorrow}>Morgen</option>
                    <option value="custom">Datum wählen…</option>
                    <option value="">Kein Datum</option>
                  </select>
                </label>
                {dueDatePreset === "custom" && (
                  <label className="date-select custom-date-picker">
                    <input
                      type="date"
                      value={customDueDate}
                      onChange={(event) => setCustomDueDate(event.target.value)}
                      aria-label="Zukünftiges Datum wählen"
                    />
                  </label>
                )}
                <button className="add-submit" type="submit" disabled={!taskTitle.trim() || (dueDatePreset === "custom" && !customDueDate)}>
                  Aufgabe hinzufügen <ArrowRight size={15} />
                </button>
                <button
                  className="add-cancel"
                  type="button"
                  aria-label="Abbrechen"
                  onClick={() => {
                    setIsAdding(false);
                    setTaskTitle("");
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {!isAdding && <span className="enter-hint"><kbd>↵</kbd></span>}
          </form>

          <div className="list-toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Aufgaben filtern">
              {[['all', 'Alles'], ['open', 'Offen'], ['done', 'Erledigt']].map(([id, label]) => (
                <button
                  role="tab"
                  aria-selected={filter === id}
                  className={`filter-tab ${filter === id ? "active" : ""}`}
                  key={id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                  <span>
                    {id === "all"
                      ? scopedTasks.length
                      : id === "open"
                        ? scopedTasks.filter((task) => !isTaskDone(task)).length
                        : scopedTasks.filter((task) => isTaskDone(task)).length}
                  </span>
                </button>
              ))}
            </div>
            <span className="task-total">
              <span className="total-dot" />
              {visibleTasks.length} {visibleTasks.length === 1 ? "Aufgabe" : "Aufgaben"}
            </span>
          </div>

          <TaskList
            visibleTasks={visibleTasks}
            filter={filter}
            query={query}
            view={view}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAddFirst={() => {
              setView("today");
              setFilter("all");
              setIsAdding(true);
              document.querySelector(".quick-add input")?.focus();
            }}
          />

          <footer className="list-footer">
            <div className="footer-spark">
              <Sparkles size={15} />
            </div>
            <span>
              {todayTasks.length === 0
                ? "Freiraum ist Teil des Plans."
                : "Eins nach dem anderen. Du bist genau richtig hier."}
            </span>
            <span className="footer-rule" />
          </footer>
        </section>
      </main>
    </div>
  );
}

export default TaskApp;
