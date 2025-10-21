import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { AppDataSource } from '../../src/data-source';
import { Board } from '../../src/entity/Board';
import {
  getBoard,
  createBoard,
  deleteBoard,
  changeParentBoard,
} from '../../src/controller/BoardController';

const app = express();
app.use(bodyParser.json());
app.get('/board/:id', getBoard);
app.post('/board', createBoard);
app.delete('/board/:id', deleteBoard);
app.put('/board/:id/change-parent', changeParentBoard);

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
    const res = await request(app).post('/board').send({
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
  describe('max board depth', () => {
    let rootId: number, childId: number;

    beforeEach(async () => {
      // Set up a root and child to approach the max depth
      const repo = AppDataSource.getRepository(Board);
      await repo.clear();

      const root = repo.create({ name: 'Depth Root' });
      await repo.save(root);
      rootId = root.id;

      const child = repo.create({ name: 'Depth Child', parent: root });
      await repo.save(child);
      childId = child.id;
    });

    it('should allow creating a board at max depth', async () => {
      // MAX_BOARD_DEPTH is 3, so this is depth 3
      const res = await request(app)
        .post('/board')
        .send({ name: 'Depth Grandchild', parentId: childId });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Depth Grandchild');
      expect(res.body.parent.id).toBe(childId);
    });

    it('should not allow creating a board exceeding max depth', async () => {
      // Create grandchild at depth 3
      const repo = AppDataSource.getRepository(Board);
      const grandchild = repo.create({
        name: 'Depth Grandchild',
        parent: { id: childId } as Board,
      });
      await repo.save(grandchild);

      // Try to create great-grandchild at depth 4 (should fail)
      const res = await request(app)
        .post('/board')
        .send({ name: 'Too Deep', parentId: grandchild.id });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/max board depth/i);
    });
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
    const child = repo.create({
      name: 'Child',
      description: 'Child board',
      parent: root,
    });
    await repo.save(child);
    childId = child.id;

    // Create a grandchild board
    const grandchild = repo.create({
      name: 'Grandchild',
      description: 'Grandchild board',
      parent: child,
    });
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

app.put('/board/:id/change-parent', changeParentBoard);

// ...existing code...

describe('PUT /board/:id/change-parent', () => {
  let rootId: number, childId: number, newParentId: number;

  beforeEach(async () => {
    const repo = AppDataSource.getRepository(Board);
    // Clean up before each test
    await repo.clear();

    // Create a root board
    const root = repo.create({ name: 'Root', description: 'Root board' });
    await repo.save(root);
    rootId = root.id;

    // Create a child board
    const child = repo.create({
      name: 'Child',
      description: 'Child board',
      parent: root,
    });
    await repo.save(child);
    childId = child.id;

    // Create a new parent board
    const newParent = repo.create({
      name: 'New Parent',
      description: 'New parent board',
    });
    await repo.save(newParent);
    newParentId = newParent.id;
  });

  afterEach(async () => {
    const repo = AppDataSource.getRepository(Board);
    await repo.clear();
  });

  it('should change the parent of a board', async () => {
    const res = await request(app)
      .put(`/board/${childId}/change-parent`)
      .send({ newParentId });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(childId);
    expect(res.body.parent.id).toBe(newParentId);
  });

  it('should return 400 if board id is invalid', async () => {
    const res = await request(app)
      .put('/board/abc/change-parent')
      .send({ newParentId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid board id or new parent id');
  });

  it('should return 400 if new parent id is invalid', async () => {
    const res = await request(app)
      .put(`/board/${childId}/change-parent`)
      .send({ newParentId: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid board id or new parent id');
  });

  it('should return 404 if board does not exist', async () => {
    const res = await request(app)
      .put('/board/99999/change-parent')
      .send({ newParentId });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Board not found');
  });

  it('should return 400 if new parent does not exist', async () => {
    const res = await request(app)
      .put(`/board/${childId}/change-parent`)
      .send({ newParentId: 99999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('New parent board not found');
  });

  it('should return 400 if trying to set board as its own parent', async () => {
    const res = await request(app)
      .put(`/board/${childId}/change-parent`)
      .send({ newParentId: childId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('A board cannot be its own parent');
  });
  describe('max board depth when moving', () => {
    let rootId: number,
      childId: number,
      grandchildId: number,
      newParentId: number;

    beforeEach(async () => {
      const repo = AppDataSource.getRepository(Board);
      await repo.clear();

      // Create a root board
      const root = repo.create({ name: 'Root' });
      await repo.save(root);
      rootId = root.id;

      // Create a child board
      const child = repo.create({ name: 'Child', parent: root });
      await repo.save(child);
      childId = child.id;

      // Create a grandchild board
      const grandchild = repo.create({ name: 'Grandchild', parent: child });
      await repo.save(grandchild);
      grandchildId = grandchild.id;

      // Create a new parent board (at root level)
      const newParent = repo.create({ name: 'New Parent' });
      await repo.save(newParent);
      newParentId = newParent.id;
    });

    it('should allow moving a subtree if it does not exceed max depth', async () => {
      // Move 'child' (with its grandchild) under 'New Parent'
      // If MAX_BOARD_DEPTH is 3, this is allowed: New Parent -> Child -> Grandchild
      const res = await request(app)
        .put(`/board/${childId}/change-parent`)
        .send({ newParentId });
      expect(res.status).toBe(200);
      expect(res.body.parent.id).toBe(newParentId);
    });

    it('should not allow moving a subtree if it would exceed max depth', async () => {
      // Add a great-grandchild to make the subtree depth 3
      const repo = AppDataSource.getRepository(Board);
      const greatGrandchild = repo.create({
        name: 'Great Grandchild',
        parent: { id: grandchildId } as Board,
      });
      await repo.save(greatGrandchild);

      // Now, moving 'child' (with grandchild and great-grandchild) under 'New Parent'
      // would make the depth: New Parent -> Child -> Grandchild -> Great Grandchild (depth 4)
      const res = await request(app)
        .put(`/board/${childId}/change-parent`)
        .send({ newParentId });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/max board depth/i);
    });
  });
});
