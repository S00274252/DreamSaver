import request from 'supertest';
import { app } from '../../app';
import { connectDB, disconnectDB } from '../../config/database';
import { UserModel } from '../../models/users';
import { DepositModel } from '../../models/deposits';
import { FundModel } from '../../models/funds';
import { DreamModel } from '../../models/dreams';

const missingId = '507f1f77bcf86cd799439011';

const validUser = { name: 'Roman', email: 'roman@example.com', password: 'supersecret123' };

const clearDatabase = async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    DepositModel.deleteMany({}),
    FundModel.deleteMany({}),
    DreamModel.deleteMany({}),
  ]);
};

const createUser = async (): Promise<string> => {
  const response = await request(app).post('/api/v1/users').send(validUser);
  return response.body._id;
};

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await clearDatabase();
  await disconnectDB();
});

describe('Users API', () => {
  it('POST /users creates a user and never returns the password hash', async () => {
    const response = await request(app).post('/api/v1/users').send(validUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Roman', email: 'roman@example.com' });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('password');
  });

  it('stores a hashed password', async () => {
    await request(app).post('/api/v1/users').send(validUser);

    const stored = await UserModel.findOne({ email: validUser.email }).select('+passwordHash');
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toContain(validUser.password);
  });

  it('POST /users rejects invalid data', async () => {
    const response = await request(app).post('/api/v1/users').send({ name: '', email: 'bad', password: '1' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

  it('POST /users returns 409 for a duplicate email', async () => {
    await request(app).post('/api/v1/users').send(validUser);
    await UserModel.init();
    const response = await request(app).post('/api/v1/users').send(validUser);

    expect(response.status).toBe(409);
  });

  it('GET /users/:id returns 400 for an invalid id and 404 for a missing user', async () => {
    expect((await request(app).get('/api/v1/users/sillyID')).status).toBe(400);
    expect((await request(app).get(`/api/v1/users/${missingId}`)).status).toBe(404);
  });

  it('PUT /users/:id updates a user', async () => {
    const id = await createUser();
    const response = await request(app).put(`/api/v1/users/${id}`).send({ name: 'Roman K' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Roman K');
  });

  it('DELETE /users/:id also deletes the user\'s data', async () => {
    const id = await createUser();
    await request(app).post('/api/v1/deposits').send({ userId: id, amount: 100 });
    await request(app).post('/api/v1/dreams').send({ userId: id, title: 'Car', targetAmount: 5000 });

    const response = await request(app).delete(`/api/v1/users/${id}`);

    expect(response.status).toBe(200);
    expect(await DepositModel.countDocuments({ userId: id })).toBe(0);
    expect(await DreamModel.countDocuments({ userId: id })).toBe(0);
  });
});

describe('Deposits API', () => {
  it('POST /deposits creates a deposit', async () => {
    const userId = await createUser();
    const response = await request(app).post('/api/v1/deposits').send({ userId, amount: 250, note: 'January' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ userId, amount: 250, note: 'January' });
  });

  it('POST /deposits returns 404 when the user does not exist', async () => {
    const response = await request(app).post('/api/v1/deposits').send({ userId: missingId, amount: 250 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it('POST /deposits rejects a negative amount', async () => {
    const userId = await createUser();
    const response = await request(app).post('/api/v1/deposits').send({ userId, amount: -10 });

    expect(response.status).toBe(400);
  });

  it('GET /deposits?userId= only returns that user\'s deposits', async () => {
    const userId = await createUser();
    await request(app).post('/api/v1/deposits').send({ userId, amount: 100 });
    await DepositModel.create({ userId: missingId, amount: 999 });

    const response = await request(app).get(`/api/v1/deposits?userId=${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].amount).toBe(100);
  });

  it('GET /deposits rejects an invalid userId filter', async () => {
    expect((await request(app).get('/api/v1/deposits?userId=nope')).status).toBe(400);
  });

  it('PUT and DELETE /deposits/:id edit and remove a deposit', async () => {
    const userId = await createUser();
    const created = await request(app).post('/api/v1/deposits').send({ userId, amount: 100 });
    const id = created.body._id;

    const updated = await request(app).put(`/api/v1/deposits/${id}`).send({ amount: 175 });
    expect(updated.status).toBe(200);
    expect(updated.body.amount).toBe(175);

    const deleted = await request(app).delete(`/api/v1/deposits/${id}`);
    expect(deleted.status).toBe(200);
    expect((await request(app).get(`/api/v1/deposits/${id}`)).status).toBe(404);
  });
});

describe('Funds API', () => {
  it('POST /funds creates a static fund', async () => {
    const userId = await createUser();
    const response = await request(app)
      .post('/api/v1/funds')
      .send({ userId, name: 'Emergency savings', type: 'static', amount: 500 });

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('static');
  });

  it('POST /funds creates an interest fund', async () => {
    const userId = await createUser();
    const response = await request(app).post('/api/v1/funds').send({
      userId, name: 'Fixed 12m', type: 'interest', amount: 5000,
      interestRate: 3.5, startDate: '2026-01-01', durationMonths: 12,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ interestRate: 3.5, durationMonths: 12 });
  });

  it('POST /funds rejects an interest fund without interest details', async () => {
    const userId = await createUser();
    const response = await request(app)
      .post('/api/v1/funds')
      .send({ userId, name: 'Fixed', type: 'interest', amount: 5000 });

    expect(response.status).toBe(400);
  });

  it('PUT /funds/:id cannot turn a static fund into an incomplete interest fund', async () => {
    const userId = await createUser();
    const created = await request(app)
      .post('/api/v1/funds')
      .send({ userId, name: 'Emergency', type: 'static', amount: 500 });

    const response = await request(app).put(`/api/v1/funds/${created.body._id}`).send({ type: 'interest' });

    expect(response.status).toBe(400);
  });

  it('PUT and DELETE /funds/:id edit and remove a fund', async () => {
    const userId = await createUser();
    const created = await request(app)
      .post('/api/v1/funds')
      .send({ userId, name: 'Emergency', type: 'static', amount: 500 });
    const id = created.body._id;

    const updated = await request(app).put(`/api/v1/funds/${id}`).send({ amount: 750 });
    expect(updated.status).toBe(200);
    expect(updated.body.amount).toBe(750);

    expect((await request(app).delete(`/api/v1/funds/${id}`)).status).toBe(200);
    expect((await request(app).delete(`/api/v1/funds/${id}`)).status).toBe(404);
  });
});

describe('Dreams API', () => {
  it('POST /dreams creates a dream that is not achieved yet', async () => {
    const userId = await createUser();
    const response = await request(app).post('/api/v1/dreams').send({ userId, title: 'New car', targetAmount: 15000 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ title: 'New car', targetAmount: 15000, achieved: false });
  });

  it('PUT /dreams/:id edits a dream', async () => {
    const userId = await createUser();
    const created = await request(app).post('/api/v1/dreams').send({ userId, title: 'Car', targetAmount: 15000 });

    const response = await request(app)
      .put(`/api/v1/dreams/${created.body._id}`)
      .send({ targetAmount: 12000, achieved: true });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ targetAmount: 12000, achieved: true });
  });

  it('GET /dreams/:id returns 404 for a missing dream', async () => {
    expect((await request(app).get(`/api/v1/dreams/${missingId}`)).status).toBe(404);
  });
});

describe('Balance, prediction and dream estimate', () => {
  const setup = async () => {
    const userId = await createUser();
    await DepositModel.create({ userId, amount: 200, date: new Date('2020-01-15') });
    await DepositModel.create({ userId, amount: 300, date: new Date('2020-02-15') });
    await FundModel.create({ userId, name: 'Emergency', type: 'static', amount: 500 });
    return userId;
  };

  it('GET /users/:id/balance adds deposits and funds', async () => {
    const userId = await setup();
    const response = await request(app).get(`/api/v1/users/${userId}/balance`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      depositsTotal: 500,
      staticFundsTotal: 500,
      interestEarned: 0,
      totalBalance: 1000,
    });
  });

  it('balance updates when a deposit is edited', async () => {
    const userId = await setup();
    const deposit = await DepositModel.findOne({ userId, amount: 200 });

    await request(app).put(`/api/v1/deposits/${deposit?._id}`).send({ amount: 400 });
    const response = await request(app).get(`/api/v1/users/${userId}/balance`);

    expect(response.body.totalBalance).toBe(1200);
  });

  it('GET /users/:id/balance returns 404 for a missing user', async () => {
    expect((await request(app).get(`/api/v1/users/${missingId}/balance`)).status).toBe(404);
  });

  it('GET /users/:id/prediction uses the monthlyDeposit override', async () => {
    const userId = await setup();
    const future = new Date();
    future.setUTCFullYear(future.getUTCFullYear() + 1);

    const response = await request(app)
      .get(`/api/v1/users/${userId}/prediction`)
      .query({ date: future.toISOString(), monthlyDeposit: 100 });

    expect(response.status).toBe(200);
    expect(response.body.currentBalance).toBe(1000);
    expect(response.body.predictedBalance).toBeGreaterThanOrEqual(1000 + 11 * 100);
  });

  it('GET /users/:id/prediction requires a valid date', async () => {
    const userId = await setup();

    expect((await request(app).get(`/api/v1/users/${userId}/prediction`)).status).toBe(400);
    expect((await request(app).get(`/api/v1/users/${userId}/prediction?date=nope`)).status).toBe(400);
  });

  it('GET /dreams/:id/estimate returns months remaining', async () => {
    const userId = await setup();
    const dream = await request(app).post('/api/v1/dreams').send({ userId, title: 'Car', targetAmount: 1500 });

    const response = await request(app).get(`/api/v1/dreams/${dream.body._id}/estimate?monthlyDeposit=100`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ achievable: true, currentBalance: 1000, monthsRemaining: 5 });
    expect(response.body.estimatedDate).toEqual(expect.any(String));
  });

  it('dream estimate reports an already reachable goal', async () => {
    const userId = await setup();
    const dream = await request(app).post('/api/v1/dreams').send({ userId, title: 'Bike', targetAmount: 800 });

    const response = await request(app).get(`/api/v1/dreams/${dream.body._id}/estimate`);

    expect(response.body).toMatchObject({ achievable: true, monthsRemaining: 0 });
  });
});

describe('General API behaviour', () => {
  it('returns JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nothing-here');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Route not found' });
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await request(app)
      .post('/api/v1/deposits')
      .set('Content-Type', 'application/json')
      .send('{ not json');

    expect(response.status).toBe(400);
  });
});
