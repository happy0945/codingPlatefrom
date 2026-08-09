// ============================================================
// Auth Controller Tests — register, login, logout, deleteProfile
// ============================================================
const { register, login, logout, deleteProfile } = require('../src/controllers/userAuthent');
const User = require('../src/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../src/config/redis');

jest.mock('../src/models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../src/config/redis', () => ({
  set: jest.fn(),
  expireAt: jest.fn(),
}));

// Helpers
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

process.env.JWT_KEY = 'test_jwt_secret';

// ─── REGISTER ───────────────────────────────────────────────
describe('register()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 400 if mandatory fields are missing', async () => {
    const req = { body: { emailId: 'user@test.com' } }; // no firstName, no password
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Some Field Missing' })
    );
  });

  it('should return 400 for invalid email', async () => {
    const req = { body: { firstName: 'John', emailId: 'bad-email', password: 'StrongP@ss1!' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid Email' })
    );
  });

  it('should return 400 for weak password', async () => {
    const req = { body: { firstName: 'John', emailId: 'user@test.com', password: '123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Week Password' })
    );
  });

  it('should create user, set cookie, return 201 on valid registration', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password');
    User.create.mockResolvedValue({
      _id: 'uid1',
      firstName: 'John',
      emailId: 'john@test.com',
      role: 'user',
    });
    jwt.sign.mockReturnValue('mock_token');

    const req = {
      body: { firstName: 'John', emailId: 'john@test.com', password: 'StrongP@ss1!' },
    };
    const res = mockRes();

    await register(req, res);

    expect(User.create).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith('token', 'mock_token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Registered Successfully' })
    );
  });

  it('should return 400 when User.create throws (e.g. duplicate email)', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password');
    User.create.mockRejectedValue(new Error('duplicate key error'));

    const req = {
      body: { firstName: 'John', emailId: 'john@test.com', password: 'StrongP@ss1!' },
    };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'duplicate key error' })
    );
  });
});

// ─── LOGIN ──────────────────────────────────────────────────
describe('login()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return 401 if emailId is missing', async () => {
    const req = { body: { password: 'SomePass@1' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid Credentials' })
    );
  });

  it('should return 401 if password is missing', async () => {
    const req = { body: { emailId: 'user@test.com' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 if user does not exist', async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { emailId: 'ghost@test.com', password: 'StrongP@ss1!' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid Credentials' })
    );
  });

  it('should return 401 if password does not match', async () => {
    User.findOne.mockResolvedValue({ _id: 'uid1', password: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { emailId: 'user@test.com', password: 'WrongPass!' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should login successfully and set cookie on valid credentials', async () => {
    const mockUser = { _id: 'uid1', firstName: 'Jane', emailId: 'jane@test.com', role: 'user', password: 'hashed' };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_jwt_token');

    const req = { body: { emailId: 'jane@test.com', password: 'StrongP@ss1!' } };
    const res = mockRes();
    await login(req, res);

    expect(res.cookie).toHaveBeenCalledWith('token', 'mock_jwt_token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Login Successfully' })
    );
  });
});

// ─── LOGOUT ─────────────────────────────────────────────────
describe('logout()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should blacklist token in Redis and clear cookie on logout', async () => {
    const fakeToken = 'some.valid.token';
    jwt.decode.mockReturnValue({ exp: 9999999999 });
    redisClient.set.mockResolvedValue('OK');
    redisClient.expireAt.mockResolvedValue(1);

    const req = { cookies: { token: fakeToken } };
    const res = mockRes();
    await logout(req, res);

    expect(redisClient.set).toHaveBeenCalledWith(`token:${fakeToken}`, 'Blocked');
    expect(redisClient.expireAt).toHaveBeenCalledWith(`token:${fakeToken}`, 9999999999);
    expect(res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged Out Successfully' });
  });

  it('should return 503 if logout fails (e.g. Redis unavailable)', async () => {
    jwt.decode.mockReturnValue({ exp: 9999999999 });
    redisClient.set.mockRejectedValue(new Error('Redis connection refused'));

    const req = { cookies: { token: 'bad.token' } };
    const res = mockRes();
    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Logout failed') })
    );
  });
});

// ─── DELETE PROFILE ─────────────────────────────────────────
describe('deleteProfile()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should delete user and return 200', async () => {
    User.findByIdAndDelete.mockResolvedValue({ _id: 'uid1' });
    const req = { result: { _id: 'uid1' } };
    const res = mockRes();
    await deleteProfile(req, res);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith('uid1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 500 if deletion fails', async () => {
    User.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
    const req = { result: { _id: 'uid1' } };
    const res = mockRes();
    await deleteProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
