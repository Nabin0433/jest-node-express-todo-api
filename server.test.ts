import request from 'supertest';
import server from './server';
import prisma from './database';

jest.mock('./database', () => ({
    task: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
    },
    $disconnect: jest.fn(),
}));

describe('Task API Endpoints', () => {
    afterAll(async () => {
        await prisma.$disconnect();
        server.close();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await prisma.task.deleteMany();
    });

    it('should get all tasks', async () => {
        const taskData = { title: 'Test Task', color: '#FF3B30' };
        await prisma.task.create({ data: taskData });

        const res = await request(server).get('/tasks');
        expect(res.status).toBe(200);
    });

    it('should get all tasks if error', async () => {
        (prisma.task.findMany as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const res = await request(server).get('/tasks');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error retrieving tasks');
    });

    it('should create a new task', async () => {
        const taskData = { title: 'Test Task', color: '#FF3B30' };
        const res = await request(server).post('/tasks').send(taskData);
        expect(res.status).toBe(200);
    });

    it('should return 400 for empty title', async () => {
        const taskData = { color: '#FF3B30', title: ' ' };
        const res = await request(server).post('/tasks').send(taskData);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Title required');
    });

    it('should return 400 for missing title', async () => {
        const taskData = { color: '#FF3B30' };
        const res = await request(server).post('/tasks').send(taskData);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Title and color are required');
    });

    it('should return 500 for invalid color', async () => {
        const taskData = { title: 'Test Task', color: '#InvalidColor' };
        const res = await request(server).post('/tasks').send(taskData);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid color code');
    });

    it('should get error on create task', async () => {
        (prisma.task.create as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
        const taskData = { title: 'Test Task', color: '#FF3B30' };

        const res = await request(server).post('/tasks').send(taskData);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error creating task');
    });

    it('should return task', async () => {
        (prisma.task.findFirst as jest.Mock).mockResolvedValueOnce({
            title: 'Test Task',
            color: '#FF3B30',
            id: 1,
            completed: false,
        });

        const res = await request(server).get('/tasks/1');
        expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent task', async () => {
        const res = await request(server).get('/tasks/nonexistent-id');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Task not found');
    });

    it('should return 500 for error task', async () => {
        (prisma.task.findFirst as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const res = await request(server).get('/tasks/nonexistent-id');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error retrieving task');
    });


    it('should error on epmpty color update', async () => {
        (prisma.task.update as jest.Mock).mockResolvedValueOnce({
            title: 'test ',
            color: '',
            id: 1,
            completed: false,
        });

        const createdTask = await prisma.task.update({
            where: { id: '1' },
            data: {
                title: 'Test Task',
                color: '#FF3B30',
                completed: false,
            },
        });

        const res = await request(server).put(`/tasks/${createdTask.id}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Title and color are required');
    });

    it('should error on empty title update', async () => {
        const taskData = { title: 'Test Task', color: '#FF3B30' };

        const createdTask = { id: '1', title: 'Test Task', color: '#FF3B30', completed: false };
        (prisma.task.create as jest.Mock).mockResolvedValueOnce(createdTask);

        await request(server).post('/tasks').send(taskData);

        const updatedData = { title: ' ', color: '#FF3B30', completed: false };

        (prisma.task.update as jest.Mock).mockResolvedValueOnce({
            ...createdTask,
            ...updatedData,
        });

        const res = await request(server).put(`/tasks/${createdTask.id}`).send(updatedData);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Title required');
    });

    it('should update an existing task', async () => {
        (prisma.task.findFirst as jest.Mock).mockResolvedValueOnce({
            title: 'Test Task',
            color: '#FF3B30',
            id: 1,
            completed: false,
        });
        const taskData = { title: 'Test Task', color: '#FF3B30' };

        const createdTask = { id: '1', title: 'Test Task', color: '#FF3B30', completed: false };
        (prisma.task.create as jest.Mock).mockResolvedValueOnce(createdTask);

        await request(server).post('/tasks').send(taskData);

        const updatedData = { title: 'update', color: '#FF3B30', completed: false };

        (prisma.task.update as jest.Mock).mockResolvedValueOnce({
            ...createdTask,
            ...updatedData,
        });

        const res = await request(server).put(`/tasks/${createdTask.id}`).send(updatedData);

        expect(res.status).toBe(200);
    });

    it('should return 404 for updating non-existent color', async () => {
        const updatedData = { title: 'Updated Task', color: '#4CAF50', completed: true };
        const res = await request(server).put('/tasks/nonexistent-id').send(updatedData);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid color code');
    });

    it('should return 404 for updating non-existent task', async () => {
        const taskData = { title: 'Test Task', color: '#FF3B30' };

        const createdTask = { id: '1', title: 'Test Task', color: '#FF3B30', completed: false };
        (prisma.task.create as jest.Mock).mockResolvedValueOnce(createdTask);

        await request(server).post('/tasks').send(taskData);

        const updatedData = { title: 'update', color: '#FF3B30', completed: false };

        (prisma.task.update as jest.Mock).mockResolvedValueOnce({
            ...createdTask,
            ...updatedData,
        });

        const res = await request(server).put(`/tasks/${createdTask.id}`).send(updatedData);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Task not found');
    });


    it('should delete an existing task', async () => {
        (prisma.task.create as jest.Mock).mockResolvedValueOnce({
            title: 'Test Task',
            color: '#FF3B30',
            id: 1,
            completed: false,
        });

        (prisma.task.delete as jest.Mock).mockResolvedValueOnce({
            title: 'Test Task',
            color: '#FF3B30',
            id: 1,
            completed: false,
        });

        const createdTask = await prisma.task.create({
            data: {
                title: 'Test Task',
                color: '#FF3B30',
                completed: false,
            },
        });

        const res = await request(server).delete(`/tasks/${createdTask.id}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Task deleted');
    });

    it('should error on update task', async () => {
        (prisma.task.findFirst as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
        (prisma.task.update as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const updatedData = { title: 'update', color: '#FF3B30', completed: false };
        const res = await request(server).put(`/tasks/1`).send(updatedData);

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error updating task');
    });


    it('should return 404 for deleting non-existent task', async () => {
        (prisma.task.delete as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
        const res = await request(server).delete('/tasks/nonexistent-id');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Task not found');
    });
});
