import { useEffect, useState } from "react";
import './App.css';

const API_URL = "http://localhost:3000/api/artworks";

const CONDITION_OPTIONS = [
  'Excelente',
  'Bueno', 
  'Regular',
  'En restauración',
  'Dañado'
];

function App() {
  const [artworks, setArtworks] = useState([]);
  
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [technique, setTechnique] = useState("");
  const [location, setLocation] = useState("");
  const [inventoryNumber, setInventoryNumber] = useState("");
  const [condition, setCondition] = useState("Bueno");
  
  const [loading, setLoading] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadArtworks();
  }, []);

  async function loadArtworks() {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setArtworks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !artist.trim() || !year || !inventoryNumber.trim()) {
      window.alert("Título, artista, año y número de inventario son obligatorios");
      return;
    }

    if (isNaN(year) || year < -3000 || year > new Date().getFullYear()) {
      window.alert("Año no válido");
      return;
    }

    if (!editingArtwork) {
      const existing = artworks.find(a => a.inventoryNumber === inventoryNumber);
      if (existing) {
        window.alert("Ya existe una obra con ese número de inventario");
        return;
      }
    }

    const artworkData = {
      title,
      artist,
      year: parseInt(year),
      description,
      technique,
      location,
      inventoryNumber,
      condition
    };

    try {
      if (editingArtwork) {
        await fetch(`${API_URL}/${editingArtwork._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(artworkData),
        });
        setEditingArtwork(null);
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(artworkData),
        });
      }

      setTitle("");
      setArtist("");
      setYear("");
      setDescription("");
      setTechnique("");
      setLocation("");
      setInventoryNumber("");
      setCondition("Bueno");
      
      await loadArtworks();
      
    } catch (error) {
      console.error(error);
      window.alert("Error al guardar la obra");
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`¿Eliminar la obra "${title}"?`)) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      await loadArtworks();
    } catch (error) {
      console.error(error);
      window.alert("Error al eliminar la obra");
    }
  }

  function handleEdit(artwork) {
    setTitle(artwork.title);
    setArtist(artwork.artist);
    setYear(artwork.year);
    setDescription(artwork.description || "");
    setTechnique(artwork.technique || "");
    setLocation(artwork.location || "");
    setInventoryNumber(artwork.inventoryNumber);
    setCondition(artwork.condition || "Bueno");
    setEditingArtwork(artwork);
  }

  function resetForm() {
    setTitle("");
    setArtist("");
    setYear("");
    setDescription("");
    setTechnique("");
    setLocation("");
    setInventoryNumber("");
    setCondition("Bueno");
    setEditingArtwork(null);
  }

  const uniqueLocations = [...new Set(artworks.map(a => a.location).filter(Boolean))];

  const filteredArtworks = artworks.filter(artwork => {
    if (filterLocation && artwork.location !== filterLocation) return false;
    if (filterCondition && artwork.condition !== filterCondition) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        artwork.title?.toLowerCase().includes(term) ||
        artwork.artist?.toLowerCase().includes(term) ||
        artwork.description?.toLowerCase().includes(term) ||
        artwork.inventoryNumber?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="app-container">
      <div className="header">
        <h1>🏛️ SISTEMA DE INVENTARIO DEL MUSEO</h1>
        <p>Gestión de Colecciones - Obras de Arte</p>
      </div>

      <div className="toolbar">
        <button className="btn btn-reload" onClick={loadArtworks}>
          🔄 Recargar
        </button>
      </div>

      <div className="filters-section">
        <h3 className="filters-title">🔍 Filtros de búsqueda</h3>
        <div className="filters-grid">
          <input
            className="filter-input"
            type="text"
            placeholder="Buscar por título, artista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="filter-select"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">📍 Todas las ubicaciones</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
          >
            <option value="">🎨 Todos los estados</option>
            {CONDITION_OPTIONS.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
        </div>

        {(filterLocation || filterCondition || searchTerm) && (
          <button 
            className="btn-clear-filters"
            onClick={() => {
              setFilterLocation("");
              setFilterCondition("");
              setSearchTerm("");
            }}
          >
            ❌ Limpiar filtros
          </button>
        )}
      </div>

      <div className={`form-section ${editingArtwork ? 'edit-mode' : ''}`}>
        <h3 className="form-title">
          {editingArtwork ? "✏️ EDITAR OBRA" : "➕ AGREGAR NUEVA OBRA"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              className="form-input"
              type="text"
              placeholder="Título *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              className="form-input"
              type="text"
              placeholder="Artista *"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />

            <input
              className="form-input"
              type="number"
              placeholder="Año *"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />

            <input
              className="form-input"
              type="text"
              placeholder="Nº Inventario *"
              value={inventoryNumber}
              onChange={(e) => setInventoryNumber(e.target.value)}
              required
              disabled={editingArtwork}
            />

            <input
              className="form-input"
              type="text"
              placeholder="Técnica"
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
            />

            <input
              className="form-input"
              type="text"
              placeholder="Ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <select
              className="form-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              {CONDITION_OPTIONS.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>

            <textarea
              className="form-textarea"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-buttons">
            <button className="btn-submit" type="submit">
              {editingArtwork ? "✏️ Actualizar Obra" : "➕ Agregar al Inventario"}
            </button>
            
            {editingArtwork && (
              <button className="btn-cancel" type="button" onClick={resetForm}>
                ❌ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{artworks.length}</span>
          <span className="stat-label">Total Obras</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{artworks.filter(a => a.condition === 'Excelente').length}</span>
          <span className="stat-label">Excelente</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{artworks.filter(a => a.condition === 'Bueno').length}</span>
          <span className="stat-label">Bueno</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{artworks.filter(a => a.condition === 'En restauración' || a.condition === 'Dañado').length}</span>
          <span className="stat-label">Requiere atención</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando inventario...</p>
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🖼️</div>
          <h3>No hay obras que coincidan con los filtros</h3>
        </div>
      ) : (
        <div>
          <div className="artworks-header">
            <h3>Colección de Obras</h3>
            <span className="artworks-count">
              Mostrando {filteredArtworks.length} de {artworks.length} obras
            </span>
          </div>
          
          <div className="artworks-grid">
            {filteredArtworks.map((artwork) => (
              <div key={artwork._id} className="artwork-card">
                <div className="artwork-header">
                  <div>
                    <h3 className="artwork-title">{artwork.title}</h3>
                    <p className="artwork-artist">{artwork.artist} • {artwork.year}</p>
                  </div>
                  <span className={`condition-badge condition-${artwork.condition.replace(' ', '')}`}>
                    {artwork.condition}
                  </span>
                </div>

                <div className="artwork-details">
                  <span className="artwork-inventory">📋 Nº INV: {artwork.inventoryNumber}</span>

                  {artwork.description && (
                    <p className="artwork-description">
                      {artwork.description.substring(0, 100)}
                      {artwork.description.length > 100 && "..."}
                    </p>
                  )}

                  <div className="artwork-metadata">
                    {artwork.technique && (
                      <span className="metadata-item">🎨 {artwork.technique}</span>
                    )}
                    {artwork.location && (
                      <span className="metadata-item">📍 {artwork.location}</span>
                    )}
                  </div>
                </div>

                <div className="artwork-actions">
                  <button className="btn-edit" onClick={() => handleEdit(artwork)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(artwork._id, artwork.title)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="footer">
        <p>🏛️ Museo de Arte - Sistema de Gestión de Inventario</p>
        <div className="footer-info">
          <span>🔗 {API_URL}</span>
          <span>📊 {new Date().toLocaleString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
}

export default App;