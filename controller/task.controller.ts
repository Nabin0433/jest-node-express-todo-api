import { Request, Response, RequestHandler } from "express";
import prisma from '../database'
import { colors } from '../utils';

export const getTasks: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks" });
  }
};

export const createTask: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { title, color } = req.body;
  if (!title || !color) {
    res.status(400).json({ message: "Title and color are required" });
    return;
  }
  if (!title.trim()) {
    res.status(400).json({ message: "Title required" });
    return;
  }
  if (!colors.includes(color)) {
    res.status(400).json({ message: "Invalid color code" });
    return;
  }

  try {
    const task = await prisma.task.create({ data: { title, color } });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};

export const getTaskById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findFirst({ where: { id } });
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving task" });
  }
};

export const updateTask: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, color, completed } = req.body;

  if (!title || !color) {
    res.status(400).json({ message: "Title and color are required" });
    return;
  }
  if (!title.trim()) {
    res.status(400).json({ message: "Title required" });
    return;
  }
  if (!colors.includes(color)) {
    res.status(400).json({ message: "Invalid color code" });
    return;
  }

  try {
    const taskfind = await prisma.task.findFirst({ where: { id } });
    if (!taskfind) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, color, completed },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

export const deleteTask: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(404).json({ message: "Task not found" });
  }
};
