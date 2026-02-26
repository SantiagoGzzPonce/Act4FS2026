const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { protect, authorize } = require('./middleware/auth'); // ← AGREGAR ESTA LÍNEA

function createArtworkRouter(ArtworkModel) {
    const router = express.Router();

    // Proteger ruta de exportación (solo admin)
    router.post("/export", protect, authorize('admin'), async (req, res) => { // ← MODIFICAR ESTA LÍNEA
        try {
            console.log('📤 Iniciando exportación del inventario del museo...');
            
            const artworks = await ArtworkModel.find().sort({ createdAt: -1 });
            
            if (!artworks || artworks.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "No hay obras en el inventario para exportar"
                });
            }
            
            const exportData = {
                museum: {
                    name: "Museo de Arte Contemporáneo",
                    department: "Registro de Colecciones",
                    address: "Av. del Arte 123, Centro Cultural",
                    phone: "+52 (55) 1234-5678",
                    email: "registro@museoarte.org"
                },
                export_info: {
                    date: new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    time: new Date().toLocaleTimeString('es-ES'),
                    format_version: "1.0",
                    exported_by: "Sistema de Gestión de Inventario"
                },
                statistics: {
                    total_artworks: artworks.length,
                    artists_count: new Set(artworks.map(a => a.artist)).size,
                    locations: new Set(artworks.map(a => a.location)).size,
                    conditions: {
                        excelente: artworks.filter(a => a.condition === 'Excelente').length,
                        bueno: artworks.filter(a => a.condition === 'Bueno').length,
                        regular: artworks.filter(a => a.condition === 'Regular').length,
                        restauracion: artworks.filter(a => a.condition === 'En restauración').length,
                        danado: artworks.filter(a => a.condition === 'Dañado').length
                    }
                },
                inventory: artworks.map(artwork => ({
                    id: artwork._id.toString(),
                    inventory_number: artwork.inventoryNumber,
                    title: artwork.title,
                    artist: artwork.artist,
                    year: artwork.year,
                    technique: artwork.technique,
                    description: artwork.description,
                    current_location: artwork.location,
                    condition: artwork.condition,
                    registered: artwork.createdAt?.toLocaleDateString('es-ES'),
                    last_revision: artwork.lastRevised?.toLocaleDateString('es-ES'),
                    record_age_days: Math.floor((new Date() - new Date(artwork.createdAt)) / (1000 * 60 * 60 * 24))
                }))
            };

            const EXPORT_PATH = path.join(process.cwd(), "museum_inventory_backup.json");
            
            await fs.writeFile(
                EXPORT_PATH, 
                JSON.stringify(exportData, null, 2), 
                "utf8"
            );

            console.log(`✅ Inventario exportado exitosamente: ${artworks.length} obras`);

            res.json({
                success: true,
                message: "✅ Inventario del museo exportado exitosamente",
                details: {
                    filename: "museum_inventory_backup.json",
                    total_artworks: artworks.length,
                    export_date: exportData.export_info.date,
                    file_size: `${(JSON.stringify(exportData).length / 1024).toFixed(2)} KB`,
                    download_url: "/api/artworks/export/download"
                }
            });

        } catch (err) {
            console.error("❌ Error exportando inventario:", err);
            res.status(500).json({
                success: false,
                error: "Error al exportar el inventario del museo",
                details: err.message
            });
        }
    });

    // Proteger ruta de descarga (solo admin)
    router.get("/export/download", protect, authorize('admin'), async (req, res) => { // ← MODIFICAR ESTA LÍNEA
        try {
            const EXPORT_PATH = path.join(process.cwd(), "museum_inventory_backup.json");
            
            try {
                await fs.access(EXPORT_PATH);
            } catch {
                return res.status(404).json({
                    success: false,
                    error: "No hay archivo de inventario exportado",
                    solution: "Primero realiza una exportación con POST /api/artworks/export"
                });
            }

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const downloadName = `inventario_museo_${formattedDate}.json`;

            res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
            res.setHeader('Content-Type', 'application/json');

            res.download(EXPORT_PATH, downloadName, (err) => {
                if (err) {
                    console.error('Error en descarga:', err);
                } else {
                    console.log(`📥 Archivo descargado: ${downloadName}`);
                }
            });
        } catch (err) {
            console.error('Error en descarga:', err);
            res.status(500).json({
                success: false,
                error: "Error al descargar el archivo",
                details: err.message
            });
        }
    });

    return router;
}

module.exports = { createArtworkRouter };