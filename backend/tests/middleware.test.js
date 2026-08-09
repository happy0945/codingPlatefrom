// ============================================================
// Auth Middleware Tests — userMiddleware, adminMiddleware
// ============================================================
const userMiddleware = require('../src/middleware/userMiddleware');
const adminMiddleware = require('../src/middleware/adminMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user');
const redisClient = require('../src/config/redis');

jest.mock('jsonwebtoken');
jest.mock('../src/models/user');
jest.mock('../src/config/redis', () => ({
  exists: jest.fn(),
}));

process.env.JWT_KEY = 'test_jwt_secret';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// ─── USER MIDDLEWARE ─────────────────────────────────────────
describe('userMiddleware()', () => {
  let next;
  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('should return 401 if no token in cookie', async () => {
    const req = { cookies: {} };
    const res = mockRes();
    await userMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Token is not persent'));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if JWT is invalid/expired', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });
    const req = { cookies: { token: 'bad.token' } };
    const res = mockRes();
    await userMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user does not exist in DB', async () => {
    jwt.verify.mockReturnValue({ _id: 'uid1' });
    User.findById.mockResolvedValue(null);
    const req = { cookies: { token: 'valid.token' } };
    const res = mockRes();
    await userMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining("User Doesn't Exist"));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is blacklisted in Redis', async () => {
    jwt.verify.mockReturnValue({ _id: 'uid1' });
    User.findById.mockResolvedValue({ _id: 'uid1', role: 'user' });
    redisClient.exists.mockResolvedValue(1); // token is blocked
    const req = { cookies: { token: 'blacklisted.token' } };
    const res = mockRes();
    await userMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user to req.result on valid token', async () => {
    const mockUser = { _id: 'uid1', role: 'user' };
    jwt.verify.mockReturnValue({ _id: 'uid1' });
    User.findById.mockResolvedValue(mockUser);
    redisClient.exists.mockResolvedValue(0); // token is NOT blocked

    const req = { cookies: { token: 'valid.token' } };
    const res = mockRes();
    await userMiddleware(req, res, next);

    expect(req.result).toEqual(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─── ADMIN MIDDLEWARE ────────────────────────────────────────
describe('adminMiddleware()', () => {
  let next;
  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('should return 401 if no token', async () => {
    const req = { cookies: {} };
    const res = mockRes();
    await adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if role is not admin', async () => {
    jwt.verify.mockReturnValue({ _id: 'uid1', role: 'user' }); // regular user
    User.findById.mockResolvedValue({ _id: 'uid1', role: 'user' });
    redisClient.exists.mockResolvedValue(0);

    const req = { cookies: { token: 'user.token' } };
    const res = mockRes();
    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Invalid Token'));
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() for valid admin token with role=admin', async () => {
    const adminUser = { _id: 'admin1', role: 'admin' };
    jwt.verify.mockReturnValue({ _id: 'admin1', role: 'admin' });
    User.findById.mockResolvedValue(adminUser);
    redisClient.exists.mockResolvedValue(0);

    const req = { cookies: { token: 'admin.valid.token' } };
    const res = mockRes();
    await adminMiddleware(req, res, next);

    expect(req.result).toEqual(adminUser);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return 401 if admin token is blacklisted', async () => {
    jwt.verify.mockReturnValue({ _id: 'admin1', role: 'admin' });
    User.findById.mockResolvedValue({ _id: 'admin1', role: 'admin' });
    redisClient.exists.mockResolvedValue(1); // blocked

    const req = { cookies: { token: 'blocked.admin.token' } };
    const res = mockRes();
    await adminMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
