
import request from "supertest";
import express from 'express';
import { AppDataSource } from '../../src/data-source';
import { Board } from '../../src/entity/Board';
import { getBoard } from '../../src/controller/BoardController';

const app = express();
app.get('/board/:id', getBoard);

beforeAll(async () => {
  await AppDataSource.initialize();
  // Seed a test board
  const repo = AppDataSource.getRepository(Board);
  const board = repo.create({
    name: 'Test Board',
    description: 'A test board',
  });
  await repo.save(board);
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe('GET /board/:id', () => {
  it('should return a board by id', async () => {
    // Find the seeded board
    const repo = AppDataSource.getRepository(Board);
    const board = await repo.findOneBy({ name: 'Test Board' });
    const res = await request(app).get(`/board/${board?.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Board');
    expect(res.body.description).toBe('A test board');
  });

  it('should return 404 for non-existent board', async () => {
    const res = await request(app).get('/board/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Board not found');
  });

  it('should return 400 for invalid id', async () => {
    const res = await request(app).get('/board/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid board id');
  });
});
