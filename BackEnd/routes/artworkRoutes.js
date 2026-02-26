const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { protect, authorize } = require('../middleware/auth');

// @desc    Obtener todas las obras
// @route   GET /api/artworks
// @access  Público
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    console.error('Error al obtener obras:', error);
    res.status(500).json({ error: 'Error al obtener las obras' });
  }
});

// @desc    Obtener una obra por ID
// @route   GET /api/artworks/:id
// @access  Público
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la obra' });
  }
});

// @desc    Crear nueva obra
// @route   POST /api/artworks
// @access  Privado (admin o editor)
router.post('/', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { title, artist, year, description, technique, location, inventoryNumber, condition } = req.body;
    
    if (!title || !artist || !year || !inventoryNumber) {
      return res.status(400).json({ 
        error: 'Los campos obligatorios son: título, artista, año y número de inventario'
      });
    }
    
    if (isNaN(year) || year < -3000 || year > new Date().getFullYear()) {
      return res.status(400).json({ error: 'Año no válido' });
    }
    
    const existingArtwork = await Artwork.findOne({ inventoryNumber });
    if (existingArtwork) {
      return res.status(400).json({ error: 'Ya existe una obra con ese número de inventario' });
    }
    
    const newArtwork = new Artwork({ 
      title, 
      artist, 
      year: parseInt(year),
      description: description || "",
      technique: technique || "",
      location: location || "",
      inventoryNumber,
      condition: condition || 'Bueno'
    });
    
    const savedArtwork = await newArtwork.save();
    res.status(201).json(savedArtwork);
  } catch (error) {
    console.error('Error al crear obra:', error);
    res.status(500).json({ error: 'Error al agregar la obra al inventario' });
  }
});

// @desc    Actualizar obra
// @route   PUT /api/artworks/:id
// @access  Privado (admin o editor)
router.put('/:id', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { title, artist, year, description, technique, location, inventoryNumber, condition } = req.body;
    
    if (year && (isNaN(year) || year < -3000 || year > new Date().getFullYear())) {
      return res.status(400).json({ error: 'Año no válido' });
    }
    
    if (inventoryNumber) {
      const existingArtwork = await Artwork.findOne({ 
        inventoryNumber, 
        _id: { $ne: req.params.id } 
      });
      if (existingArtwork) {
        return res.status(400).json({ error: 'Ya existe una obra con ese número de inventario' });
      }
    }
    
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        artist, 
        year: year ? parseInt(year) : undefined,
        description,
        technique,
        location,
        inventoryNumber,
        condition,
        lastRevised: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedArtwork) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    
    res.json(updatedArtwork);
  } catch (error) {
    console.error('Error al actualizar obra:', error);
    res.status(500).json({ error: 'Error al actualizar la obra' });
  }
});

// @desc    Eliminar obra
// @route   DELETE /api/artworks/:id
// @access  Privado (solo admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const deletedArtwork = await Artwork.findByIdAndDelete(req.params.id);
    
    if (!deletedArtwork) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    
    res.json({ message: 'Obra eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la obra' });
  }
});

module.exports = router;