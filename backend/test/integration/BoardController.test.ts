import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { AppDataSource } from '../../src/data-source';
import { Board } from '../../src/entity/Board';
import { getBoard, createBoard, deleteBoard } from '../../src/controller/BoardController';

const app = express();
app.use(bodyParser.json());
app.get('/board/:id', getBoard);
app.post('/board', createBoard);
app.delete('/board/:id', deleteBoard);

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

describe('DELETE /board/:id', () => {
  let rootId: number, childId: number, grandchildId: number;

  beforeEach(async () => {
    // Create a root board
    const repo = AppDataSource.getRepository(Board);
    const root = repo.create({ name: 'Root', description: 'Root board' });
    await repo.save(root);
    rootId = root.id;

    // Create a child board
    const child = repo.create({ name: 'Child', description: 'Child board', parent: root });
    await repo.save(child);
    childId = child.id;

    // Create a grandchild board
    const grandchild = repo.create({ name: 'Grandchild', description: 'Grandchild board', parent: child });
    await repo.save(grandchild);
    grandchildId = grandchild.id;
  });

  afterEach(async () => {
    // Clean up all boards
    const repo = AppDataSource.getRepository(Board);
    await repo.clear();
  });

  it('should delete a board and all its children recursively', async () => {
    // Delete the root board
    const res = await request(app).delete(`/board/${rootId}`);
    expect(res.status).toBe(204);

    // All boards should be deleted
    const repo = AppDataSource.getRepository(Board);
    const root = await repo.findOneBy({ id: rootId });
    const child = await repo.findOneBy({ id: childId });
    const grandchild = await repo.findOneBy({ id: grandchildId });
    expect(root).toBeNull();
    expect(child).toBeNull();
    expect(grandchild).toBeNull();
  });

  it('should return 400 for invalid id', async () => {
    const res = await request(app).delete('/board/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid board id');
  });

  it('should return 204 for non-existent board', async () => {
    const res = await request(app).delete('/board/99999');
    expect(res.status).toBe(204);
  });
});
