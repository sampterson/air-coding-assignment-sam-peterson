import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { AppDataSource } from '../../src/data-source';
import { Board } from '../../src/entity/Board';
import { getBoard, createBoard } from '../../src/controller/BoardController';

const app = express();
app.use(bodyParser.json());
app.get('/board/:id', getBoard);
app.post('/board', createBoard);

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

describe('POST /board', () => {
  it('should create a new board', async () => {
    const res = await request(app)
      .post('/board')
      .send({ name: 'New Board', description: 'A new board' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Board');
    expect(res.body.description).toBe('A new board');
    expect(res.body.id).toBeDefined();
  });

  it('should create a child board with a valid parentId', async () => {
    const repo = AppDataSource.getRepository(Board);
    const parent = await repo.findOneBy({ name: 'Test Board' });
    const res = await request(app)
      .post('/board')
      .send({
        name: 'Child Board',
        description: 'A child',
        parentId: parent?.id,
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Child Board');
    expect(res.body.parent.id).toBe(parent?.id);
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/board')
      .send({ description: 'Missing name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Name is required');
  });

  it('should return 400 if parentId does not exist', async () => {
    const res = await request(app)
      .post('/board')
      .send({ name: 'Orphan Board', parentId: 99999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Parent board not found');
  });
});
