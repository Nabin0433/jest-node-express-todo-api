import express from "express";
import cors from "cors";
import { getTasks, createTask, getTaskById, updateTask, deleteTask } from './controller/task.controller';

const app = express();

app.use(cors());
app.use(express.json());

app.get("/tasks", getTasks);
app.post("/tasks", createTask);
app.get("/tasks/:id", getTaskById);
app.put("/tasks/:id", updateTask);
app.delete("/tasks/:id", deleteTask);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log('Server running');
});

export default server;
