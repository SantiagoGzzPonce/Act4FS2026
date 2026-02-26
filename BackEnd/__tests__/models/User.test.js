const mongoose = require('mongoose');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  const url = 'mongodb://127.0.0.1:27017/museodb_test';
  await mongoose.connect(url);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Modelo User', () => {
  test('Debería crear un usuario válido', async () => {
    const userData = {
      email: 'test@test.com',
      password: 'password123',
      role: 'editor'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.password).toBe(userData.password); // Sin hash (por ahora)
  });

  test('Debería requerir email y password', async () => {
    const user = new User({});

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  test('Debería tener email único', async () => {
    const user1 = new User({
      email: 'duplicate@test.com',
      password: 'password123'
    });

    const user2 = new User({
      email: 'duplicate@test.com',
      password: 'password456'
    });

    await user1.save();

    let error;
    try {
      await user2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });

  test('Debería aceptar solo roles válidos', async () => {
    const user = new User({
      email: 'test@test.com',
      password: 'password123',
      role: 'invalido'
    });

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  test('El rol por defecto debería ser viewer', async () => {
    const user = new User({
      email: 'test@test.com',
      password: 'password123'
    });

    const savedUser = await user.save();
    expect(savedUser.role).toBe('viewer');
  });
});