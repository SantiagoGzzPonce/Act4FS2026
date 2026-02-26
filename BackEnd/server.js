const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar modelos
const Artwork = require('./models/Artwork');

// Importar rutas
const artworkRoutes = require('./routes/artworkRoutes');
const authRoutes = require('./routes/authRoutes');
const { createArtworkRouter } = require("./artworkRoutes"); // Para exportación

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/museodb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB exitosamente'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    console.log('\n📌 El servidor seguirá funcionando SIN base de datos...');
  });

// Datos de ejemplo (fallback sin MongoDB)
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

// Ruta de prueba HTML
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
        
        <h2>🔐 AUTENTICACIÓN</h2>
        
        <div class="endpoint">
          <strong>POST</strong> <code>/api/auth/register</code> - Registrar nuevo usuario
        </div>
        
        <div class="endpoint">
          <strong>POST</strong> <code>/api/auth/login</code> - Iniciar sesión (recibe JWT)
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

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use("/api/artworks", createArtworkRouter(Artwork)); // Para exportación

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🏛️  MUSEO DE ARTE - SISTEMA DE INVENTARIO');
  console.log('='.repeat(50));
  console.log(`🚀 Servidor: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/artworks`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log('='.repeat(50));
  
  await initializeDatabase();
});

process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
});

module.exports = app;