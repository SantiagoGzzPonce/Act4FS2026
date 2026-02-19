const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { createArtworkRouter } = require("./artworkRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb://127.0.0.1:27017/museodb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB exitosamente'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    console.log('\n📌 El servidor seguirá funcionando SIN base de datos...');
  });

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  inventoryNumber: { type: String, required: true, unique: true },
  description: { type: String, trim: true, default: "" },
  technique: { type: String, trim: true, default: "" },
  location: { type: String, trim: true, default: "" },
  condition: { 
    type: String, 
    enum: ['Excelente', 'Bueno', 'Regular', 'En restauración', 'Dañado'],
    default: 'Bueno'
  },
  createdAt: { type: Date, default: Date.now },
  lastRevised: { type: Date, default: Date.now }
});

const Artwork = mongoose.model('Artwork', artworkSchema);

const initialArtworks = [
  { 
    title: 'La noche estrellada', 
    artist: 'Vincent van Gogh',
    year: 1889,
    description: 'Óleo sobre lienzo que representa la vista desde la ventana de su habitación en el sanatorio',
    technique: 'Óleo sobre lienzo',
    location: 'Sala Impresionista - Ala Este',
    inventoryNumber: 'INV-001',
    condition: 'Excelente'
  },
  { 
    title: 'Mona Lisa', 
    artist: 'Leonardo da Vinci',
    year: 1503,
    description: 'Retrato de Lisa Gherardini, esposa de Francesco del Giocondo',
    technique: 'Óleo sobre tabla de álamo',
    location: 'Sala Renacentista - Ala Oeste',
    inventoryNumber: 'INV-002',
    condition: 'Bueno'
  },
  { 
    title: 'El beso', 
    artist: 'Gustav Klimt',
    year: 1908,
    description: 'Pareja abrazada cubierta por mantas decorativas con motivos geométricos',
    technique: 'Óleo y pan de oro sobre lienzo',
    location: 'Sala Modernista - Segundo piso',
    inventoryNumber: 'INV-003',
    condition: 'Excelente'
  }
];

async function initializeDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB no está conectado. Usando datos en memoria.');
      return;
    }
    
    const count = await Artwork.countDocuments();
    if (count === 0) {
      console.log('📝 Inicializando base de datos con obras de arte de ejemplo...');
      await Artwork.insertMany(initialArtworks);
      console.log('✅ Obras de arte de ejemplo agregadas correctamente.');
    } else {
      console.log(`📊 Base de datos contiene ${count} obras de arte.`);
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

app.get('/', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado';
  
  res.send(`
    <html>
      <head>
        <title>API de Inventario del Museo</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; }
          h1 { color: #2c3e50; }
          .status { padding: 15px; border-radius: 8px; margin: 20px 0; }
          .connected { background: #d4edda; border: 2px solid #28a745; }
          .disconnected { background: #f8d7da; border: 2px solid #dc3545; }
          code { background: #2c3e50; color: #ecf0f1; padding: 3px 8px; border-radius: 5px; }
          .endpoint { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; 
                     border-left: 6px solid #3498db; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .required { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>🏛️ MUSEO DE ARTE - SISTEMA DE INVENTARIO</h1>
        
        <div class="status ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}">
          <strong>Estado MongoDB:</strong> ${mongoStatus}
        </div>
        
        <h2>📋 OPERACIONES CRUD</h2>
        
        <div class="endpoint">
          <strong>GET</strong> <code>/api/artworks</code> - Obtener todas las obras
          <br>
          <a href="/api/artworks">Ver inventario completo</a>
        </div>
        
        <div class="endpoint">
          <strong>GET</strong> <code>/api/artworks/:id</code> - Obtener una obra por ID
        </div>
        
        <div class="endpoint">
          <strong>POST</strong> <code>/api/artworks</code> - Agregar nueva obra
          <br>
          <small><span class="required">*</span> Campos obligatorios: title, artist, year, inventoryNumber</small>
          <br>
          <small>Campos opcionales: description, technique, location, condition</small>
        </div>
        
        <div class="endpoint">
          <strong>PUT</strong> <code>/api/artworks/:id</code> - Actualizar obra
        </div>
        
        <div class="endpoint">
          <strong>DELETE</strong> <code>/api/artworks/:id</code> - Eliminar obra
        </div>
        
        <h2>📤 EXPORTACIÓN</h2>
        
        <div class="endpoint">
          <strong>POST</strong> <code>/api/artworks/export</code> - Exportar inventario a JSON
        </div>
        
        <div class="endpoint">
          <strong>GET</strong> <code>/api/artworks/export/download</code> - Descargar último backup
        </div>
        
        <p><strong>URL para React:</strong> <code>http://localhost:${PORT}/api/artworks</code></p>
      </body>
    </html>
  `);
});

app.get('/api/artworks', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(initialArtworks);
    }
    
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    console.error('Error al obtener obras:', error);
    res.json(initialArtworks);
  }
});

app.get('/api/artworks/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const artwork = initialArtworks.find(a => a._id === req.params.id);
      return artwork ? res.json(artwork) : res.status(404).json({ error: 'Obra no encontrada' });
    }
    
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la obra' });
  }
});

app.post('/api/artworks', async (req, res) => {
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
    
    if (mongoose.connection.readyState !== 1) {
      if (initialArtworks.some(a => a.inventoryNumber === inventoryNumber)) {
        return res.status(400).json({ error: 'Ya existe una obra con ese número de inventario' });
      }
      
      const newArtwork = {
        _id: Date.now().toString(),
        title,
        artist,
        year: parseInt(year),
        description: description || "",
        technique: technique || "",
        location: location || "",
        inventoryNumber,
        condition: condition || 'Bueno',
        createdAt: new Date(),
        lastRevised: new Date()
      };
      initialArtworks.push(newArtwork);
      return res.status(201).json(newArtwork);
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

app.put('/api/artworks/:id', async (req, res) => {
  try {
    const { title, artist, year, description, technique, location, inventoryNumber, condition } = req.body;
    
    if (year && (isNaN(year) || year < -3000 || year > new Date().getFullYear())) {
      return res.status(400).json({ error: 'Año no válido' });
    }
    
    if (mongoose.connection.readyState !== 1) {
      const artworkIndex = initialArtworks.findIndex(a => a._id === req.params.id);
      if (artworkIndex === -1) {
        return res.status(404).json({ error: 'Obra no encontrada' });
      }
      
      if (inventoryNumber && inventoryNumber !== initialArtworks[artworkIndex].inventoryNumber) {
        if (initialArtworks.some(a => a.inventoryNumber === inventoryNumber)) {
          return res.status(400).json({ error: 'Ya existe una obra con ese número de inventario' });
        }
      }
      
      initialArtworks[artworkIndex] = { 
        ...initialArtworks[artworkIndex], 
        title: title || initialArtworks[artworkIndex].title,
        artist: artist || initialArtworks[artworkIndex].artist,
        year: year ? parseInt(year) : initialArtworks[artworkIndex].year,
        description: description !== undefined ? description : initialArtworks[artworkIndex].description,
        technique: technique !== undefined ? technique : initialArtworks[artworkIndex].technique,
        location: location !== undefined ? location : initialArtworks[artworkIndex].location,
        inventoryNumber: inventoryNumber || initialArtworks[artworkIndex].inventoryNumber,
        condition: condition || initialArtworks[artworkIndex].condition,
        lastRevised: new Date()
      };
      return res.json(initialArtworks[artworkIndex]);
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

app.delete('/api/artworks/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const artworkIndex = initialArtworks.findIndex(a => a._id === req.params.id);
      if (artworkIndex === -1) {
        return res.status(404).json({ error: 'Obra no encontrada' });
      }
      initialArtworks.splice(artworkIndex, 1);
      return res.json({ message: 'Obra eliminada correctamente' });
    }
    
    const deletedArtwork = await Artwork.findByIdAndDelete(req.params.id);
    
    if (!deletedArtwork) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    
    res.json({ message: 'Obra eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la obra' });
  }
});

app.use("/api/artworks", createArtworkRouter(Artwork));

app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🏛️  MUSEO DE ARTE - SISTEMA DE INVENTARIO');
  console.log('='.repeat(50));
  console.log(`🚀 Servidor: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/artworks`);
  console.log('='.repeat(50));
  
  await initializeDatabase();
});

process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
});

module.exports = app;