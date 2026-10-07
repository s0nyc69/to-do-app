import { useEffect, useState } from 'react'
import {
  createTask as createTaskRequest,
  fetchTasks,
  isTasksApiConfigured,
  removeTask,
  updateTask,
} from '../services/tasksApi.js'
import { createBoard, fetchBoards, getOrCreateUserBoard } from '../services/boardsApi.js'

function isTaskDone(task) {
  return task?.status === 'done' || task?.completed === true
}

function readSavedTasks(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey)
    const tasks = saved ? JSON.parse(saved) : []
    return tasks.map((task) => ({
      ...task,
      status: task.status ?? (task.completed ? 'done' : 'open'),
      board_id: task.board_id ?? null,
    }))
  } catch {
    return []
  }
}

export function useTasks(userId) {
  const [boards, setBoards] = useState([])
  const [boardId, setBoardId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [connection, setConnection] = useState(isTasksApiConfigured ? 'connecting' : 'local')

  useEffect(() => {
    if (!userId) {
      setBoards([])
      setBoardId(null)
      setTasks([])
      return undefined
    }

    let active = true

    async function initializeBoards() {
      try {
        const nextBoardId = await getOrCreateUserBoard(userId)
        if (!active || !nextBoardId) return

        const nextBoards = await fetchBoards(userId)
        if (!active) return

        setBoards(nextBoards)
        setBoardId((currentBoardId) => currentBoardId ?? nextBoardId)

        if (!isTasksApiConfigured) {
          setConnection('local')
          return
        }

        const remoteTasks = await fetchTasks(nextBoardId)
        if (!active) return

        setTasks(remoteTasks)
        setConnection('cloud')
      } catch {
        if (active) setConnection('offline')
      }
    }

    initializeBoards()

    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (!boardId) {
      setTasks([])
      return undefined
    }

    const storageKey = `daymark-tasks-${userId}-${boardId}`
    const savedTasks = readSavedTasks(storageKey)
    setTasks(savedTasks)

    if (!isTasksApiConfigured) {
      setConnection('local')
      return undefined
    }

    let active = true

    async function refreshBoardTasks() {
      try {
        const remoteTasks = await fetchTasks(boardId)
        if (!active) return
        setTasks(remoteTasks)
        setConnection('cloud')
      } catch {
        if (active) setConnection('offline')
      }
    }

    refreshBoardTasks()

    return () => {
      active = false
    }
  }, [boardId, userId])

  useEffect(() => {
    if (!boardId || !userId) return undefined

    const storageKey = `daymark-tasks-${userId}-${boardId}`

    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks))
    } catch {
      // Local storage can be unavailable in restricted browser contexts.
    }

    return undefined
  }, [boardId, tasks, userId])

  async function selectBoard(nextBoardId) {
    if (!nextBoardId) return
    setBoardId(nextBoardId)

    if (!isTasksApiConfigured) {
      setConnection('local')
      setTasks(readSavedTasks(`daymark-tasks-${userId}-${nextBoardId}`))
      return
    }

    try {
      const remoteTasks = await fetchTasks(nextBoardId)
      setTasks(remoteTasks)
      setConnection('cloud')
    } catch {
      setConnection('offline')
    }
  }

  async function createBoardForUser(name) {
    if (!userId) return null

    try {
      const newBoard = await createBoard(userId, name)
      if (!newBoard) return null

      setBoards((currentBoards) => {
        const nextBoards = [...currentBoards, newBoard]
        return nextBoards.sort((a, b) => a.created_at.localeCompare(b.created_at))
      })
      await selectBoard(newBoard.id)
      return newBoard.id
    } catch {
      setConnection('offline')
      return null
    }
  }

  async function addTask(taskDetails) {
    const boardTaskDetails = {
      ...taskDetails,
      board_id: boardId,
      status: taskDetails.status ?? 'open',
    }

    const optimisticTask = {
      id: crypto.randomUUID(),
      ...boardTaskDetails,
    }
    setTasks((currentTasks) => [optimisticTask, ...currentTasks])

    if (!isTasksApiConfigured || !boardId) {
      setConnection('local')
      return
    }

    try {
      const savedTask = await createTaskRequest({
        ...boardTaskDetails,
        user_id: userId,
      })
      setTasks((currentTasks) => currentTasks.map((task) => task.id === optimisticTask.id ? savedTask : task))
      setConnection('cloud')
    } catch {
      setConnection('offline')
    }
  }

  async function toggleTask(task) {
    const nextStatus = isTaskDone(task) ? 'open' : 'done'
    setTasks((currentTasks) => currentTasks.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item))

    if (!isTasksApiConfigured || !boardId) return

    try {
      await updateTask(task.id, { status: nextStatus }, boardId)
      setConnection('cloud')
    } catch {
      setConnection('offline')
    }
  }

  async function deleteTask(task) {
    setTasks((currentTasks) => currentTasks.filter((item) => item.id !== task.id))

    if (!isTasksApiConfigured || !boardId) return

    try {
      await removeTask(task.id, boardId)
      setConnection('cloud')
    } catch {
      setConnection('offline')
    }
  }

  return {
    tasks,
    boards,
    boardId,
    connection,
    addTask,
    toggleTask,
    deleteTask,
    selectBoard,
    createBoard: createBoardForUser,
  }
}