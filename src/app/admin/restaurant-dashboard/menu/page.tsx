"use client";

import { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function MenuEditor() {
  const [menu, setMenu] = useState([]);
  const [themeColor, setThemeColor] = useState("#22c55e"); // Tailwind green-500
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    tags: "",
    category: ""
  });
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  // Fetch menu items and color on load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/restaurants/my-restaurant/menu").then((res) => res.json()),
      fetch("/api/restaurants/my-restaurant").then((res) => res.json()),
    ])
      .then(([menuData, restaurantData]) => {
        setMenu(menuData.menu || []);
        if (restaurantData.restaurant?.menuThemeColor) {
          setThemeColor(restaurantData.restaurant.menuThemeColor);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar menu ou cor");
        setLoading(false);
      });
  }, []);

  // Handle image upload for menu item
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUploading(true);
      setImageUploadError("");
      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Erro ao fazer upload da imagem');
        setNewItem({ ...newItem, image: uploadData.url });
      } catch (err) {
        setImageUploadError('Erro ao fazer upload da imagem');
      } finally {
        setImageUploading(false);
      }
    }
  };

  // Add new menu item (local only, not saved to backend yet)
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) return;
    setMenu([
      ...menu,
      {
        ...newItem,
        id: Date.now().toString(),
        price: parseFloat(newItem.price),
        tags: newItem.tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
    ]);
    setNewItem({ name: "", description: "", price: "", image: "", tags: "", category: "" });
  };

  // Remove menu item (local only)
  const handleRemove = (id) => {
    setMenu(menu.filter((item) => item.id !== id));
  };

  // Color theme picker
  const handleColorChange = (color) => {
    setThemeColor(color.hex);
  };

  // Save menu color and menu items to backend
  const handleSaveMenu = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      // Save color
      const colorRes = await fetch("/api/restaurants/my-restaurant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuThemeColor: themeColor }),
      });
      if (!colorRes.ok) throw new Error();
      // Save menu items (replace all for now)
      const menuRes = await fetch("/api/restaurants/my-restaurant/menu/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu }),
      });
      if (!menuRes.ok) throw new Error();
      setSaveSuccess(true);
    } catch {
      setSaveError("Erro ao salvar menu");
    } finally {
      setSaveLoading(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Helper to reorder menu array
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setMenu((prev) => reorder(prev, result.source.index, result.destination.index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: themeColor }}>
          Editor de Menu do Restaurante
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Menu Editor Form */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Prato</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  required
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Pratos principais">Pratos principais</option>
                  <option value="Sobremesas">Sobremesas</option>
                  {customCategories.map((cat, i) => (
                    <option value={cat} key={"custom-"+i}>{cat}</option>
                  ))}
                </select>
                <div className="flex mt-2 gap-2">
                  <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Adicionar nova categoria"
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-primary text-white font-semibold"
                    onClick={() => {
                      const val = newCategoryInput.trim();
                      if (val && !customCategories.includes(val) && !["Bebidas","Pratos principais","Sobremesas"].includes(val)) {
                        setCustomCategories([...customCategories, val]);
                        setNewCategoryInput("");
                      }
                    }}
                  >Adicionar</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Nome do prato"
                className="w-full border rounded px-3 py-2"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Descrição"
                className="w-full border rounded px-3 py-2"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={2}
              />
              <input
                type="number"
                placeholder="Preço (€)"
                className="w-full border rounded px-3 py-2"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />
              <input
                type="text"
                placeholder="Tags (ex: Vegan, Picante)"
                className="w-full border rounded px-3 py-2"
                value={newItem.tags}
                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
              {imageUploading && <div className="text-blue-500 text-sm">A fazer upload da imagem...</div>}
              {imageUploadError && <div className="text-red-600 text-sm">{imageUploadError}</div>}
              {newItem.image && (
                <img src={newItem.image} alt="Preview" className="h-24 object-cover rounded mt-2" />
              )}
              <button
                type="submit"
                className="w-full py-2 rounded bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow hover:from-green-500 hover:to-blue-600 transition-colors"
              >
                Adicionar Prato
              </button>
            </form>
            <div className="mt-8 flex flex-col gap-2">
              <button
                className="py-2 px-4 rounded bg-white border border-gray-300 shadow hover:bg-gray-100 font-semibold flex items-center gap-2"
                onClick={() => setShowColorPicker((v) => !v)}
                type="button"
              >
                <span style={{ color: themeColor }}>●</span> Escolher cor do menu
              </button>
              {showColorPicker && (
                <div className="mt-2"><SketchPicker color={themeColor} onChange={handleColorChange} /></div>
              )}
              <button
                className="mt-4 w-full py-2 rounded bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow hover:from-green-600 hover:to-blue-600 transition-colors disabled:opacity-60"
                onClick={handleSaveMenu}
                disabled={saveLoading}
                type="button"
              >
                {saveLoading ? "Salvando..." : saveSuccess ? "Salvo!" : "Salvar Menu"}
              </button>
              {saveError && <div className="text-red-600 text-center mt-2">{saveError}</div>}
            </div>
          </div>
          {/* Live Preview */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6 border-2" style={{ borderColor: themeColor }}>
            <h2 className="text-xl font-bold mb-4 text-center" style={{ color: themeColor }}>
              Pré-visualização do Menu
            </h2>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="menu-list">
                {(provided) => (
                  <div
                    className="columns-1 sm:columns-2 gap-6"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {(() => {
                      if (loading) {
                        return (
                <div className="col-span-2 text-center py-10">
                  <p>Carregando menu...</p>
                </div>
                        );
                      } else if (error) {
                        return (
                <div className="col-span-2 text-center py-10 text-red-500">
                  {error}
                </div>
                        );
                      } else if (menu.length === 0) {
                        return (
                <div className="col-span-2 text-center text-gray-400">Nenhum prato adicionado ainda.</div>
                        );
                      } else {
                        return (
                          <>
                            {menu.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={
                                      "bg-gray-50 rounded-lg shadow p-4 flex flex-col relative group border hover:shadow-lg transition mb-6 break-inside-avoid" +
                                      (snapshot.isDragging ? " ring-2 ring-primary" : "")
                                    }
                                  >
                    <img
                                      src={item.image || item.imageUrl || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="h-32 w-full object-cover rounded mb-3 border"
                      style={{ borderColor: themeColor }}
                    />
                    <div className="flex-1">
                                      {item.category && (
                                        <span
                                          className="px-2 py-0.5 rounded text-xs font-semibold mb-2 inline-block"
                                          style={{ backgroundColor: themeColor, color: '#fff' }}
                                        >
                                          {item.category}
                                        </span>
                                      )}
                      <h3 className="text-lg font-bold mb-1" style={{ color: themeColor }}>{item.name}</h3>
                      <p className="text-gray-700 mb-2 text-sm">{item.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.tags && item.tags.map((tag, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold" style={{ color: themeColor }}>
                        €{item.price.toFixed(2)}
                      </span>
                      <button
                        className="text-red-500 hover:text-red-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? "Removendo..." : "Remover"}
                      </button>
                    </div>
                  </div>
                                )}
                              </Draggable>
                            ))}
                          </>
                        );
                      }
                    })()}
                    {provided.placeholder}
            </div>
                )}
            </Droppable>
          </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
} 