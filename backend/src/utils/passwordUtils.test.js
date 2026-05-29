const { hashPassword, verifyPassword } = require('./passwordUtils');

describe('passwordUtils', () => {
  describe('hashPassword', () => {
    it('should hash a password and return different string', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toBeTruthy();
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it('should return different hash for same password (salt)', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await hashPassword('');
      expect(hashedPassword).toBeTruthy();
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password matches hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword('wrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword('testpassword123', hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});
