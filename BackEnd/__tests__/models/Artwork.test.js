const mongoose = require('mongoose');
const Artwork = require('../../models/Artwork');

// Conexión a BD de prueba antes de los tests
beforeAll(async () => {
  const url = 'mongodb://127.0.0.1:27017/museodb_test';
  await mongoose.connect(url);
});

// Limpiar BD después de cada test
afterEach(async () => {
  await Artwork.deleteMany();
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Modelo Artwork', () => {
  test('Debería crear una obra válida', async () => {
    const artworkData = {
      title: 'Test Artwork',
      artist: 'Test Artist',
      year: 2024,
      inventoryNumber: 'TEST-001',
      description: 'Test description',
      technique: 'Oil on canvas',
      location: 'Test Room',
      condition: 'Excelente'
    };

    const artwork = new Artwork(artworkData);
    const savedArtwork = await artwork.save();

    expect(savedArtwork._id).toBeDefined();
    expect(savedArtwork.title).toBe(artworkData.title);
    expect(savedArtwork.artist).toBe(artworkData.artist);
    expect(savedArtwork.year).toBe(artworkData.year);
    expect(savedArtwork.inventoryNumber).toBe(artworkData.inventoryNumber);
  });

  test('Debería requerir título, artista, año e inventoryNumber', async () => {
    const artwork = new Artwork({});

    let error;
    try {
      await artwork.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.artist).toBeDefined();
    expect(error.errors.year).toBeDefined();
    expect(error.errors.inventoryNumber).toBeDefined();
  });

  test('Debería aceptar campos opcionales como vacíos', async () => {
    const artworkData = {
      title: 'Test Minimal',
      artist: 'Test Artist',
      year: 2024,
      inventoryNumber: 'TEST-002'
    };

    const artwork = new Artwork(artworkData);
    const savedArtwork = await artwork.save();

    expect(savedArtwork.description).toBe('');
    expect(savedArtwork.technique).toBe('');
    expect(savedArtwork.location).toBe('');
    expect(savedArtwork.condition).toBe('Bueno'); // valor por defecto
  });

  test('Debería tener inventoryNumber único', async () => {
    const artwork1 = new Artwork({
      title: 'Test 1',
      artist: 'Artist 1',
      year: 2024,
      inventoryNumber: 'UNIQUE-001'
    });

    const artwork2 = new Artwork({
      title: 'Test 2',
      artist: 'Artist 2',
      year: 2024,
      inventoryNumber: 'UNIQUE-001' // Mismo número
    });

    await artwork1.save();

    let error;
    try {
      await artwork2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Código de error de duplicado en MongoDB
  });

  test('Debería aceptar solo valores válidos en condition', async () => {
    const artwork = new Artwork({
      title: 'Test',
      artist: 'Artist',
      year: 2024,
      inventoryNumber: 'TEST-003',
      condition: 'Invalido'
    });

    let error;
    try {
      await artwork.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.condition).toBeDefined();
  });
});