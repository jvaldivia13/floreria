const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('./auth');

describe('auth middleware', () => {
  const testPayload = { id: 1, email: 'test@example.com', role: 'cliente' };
  const testToken = jwt.sign(testPayload, process.env.JWT_SECRET);
  const adminPayload = { id: 2, email: 'admin@example.com', role: 'admin' };
  const adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET);

  describe('verifyToken', () => {
    it('should attach user to req when valid token in Authorization header', (done) => {
      const req = {
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      };
      const res = {};
      const next = () => {
        expect(req.user).toEqual(testPayload);
        done();
      };

      verifyToken(req, res, next);
    });

    it('should return 401 when no Authorization header', (done) => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyToken(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      done();
    });

    it('should return 401 when token is missing after Bearer', (done) => {
      const req = {
        headers: {
          authorization: 'Bearer ',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyToken(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(401);
      done();
    });

    it('should return 403 when token is invalid', (done) => {
      const req = {
        headers: {
          authorization: 'Bearer invalidtoken',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyToken(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(403);
      done();
    });

    it('should handle Authorization header without Bearer prefix', (done) => {
      const req = {
        headers: {
          authorization: testToken,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyToken(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(401);
      done();
    });
  });

  describe('verifyAdmin', () => {
    it('should call next when user is admin and token is valid', (done) => {
      const req = {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      };
      const res = {};
      const next = () => {
        expect(req.user.role).toBe('admin');
        done();
      };

      verifyAdmin(req, res, next);
    });

    it('should return 403 when user is not admin', (done) => {
      const req = {
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyAdmin(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
      done();
    });

    it('should return 401 when no Authorization header', (done) => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      verifyAdmin(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(401);
      done();
    });
  });
});
