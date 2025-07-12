"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';

const CUISINE_TYPES = [
  "Italiana", "Portuguesa", "Chinesa", "Japonesa", "Brasileira", "Indiana", "Fast Food", "Outro"
];
const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function EditRestaurantConfig() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [openingHours, setOpeningHours] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/restaurants/my-restaurant")
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data.restaurant);
        setSocialLinks(data.restaurant.socialLinks || [""]);
        setOpeningHours(
          data.restaurant.openingHours ||
            DAYS.map((day) => ({ day, open: "09:00", close: "18:00", closed: false }))
        );
        setLogoPreview(data.restaurant.imageUrl || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar restaurante");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setRestaurant({ ...restaurant, [e.target.name]: e.target.value });
  };

  const handleSocialLinkChange = (idx: number, value: string) => {
    const updated = [...socialLinks];
    updated[idx] = value;
    setSocialLinks(updated);
  };
  const addSocialLink = () => setSocialLinks([...socialLinks, ""]);
  const removeSocialLink = (idx: number) => setSocialLinks(socialLinks.filter((_, i) => i !== idx));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleOpeningHourChange = (idx: number, field: string, value: string | boolean) => {
    const updated = [...openingHours];
    updated[idx] = { ...updated[idx], [field]: value };
    setOpeningHours(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      let imageUrl = restaurant.imageUrl;
      if (logo) {
        // Upload image to /api/upload
        const formData = new FormData();
        formData.append('file', logo);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Erro ao fazer upload da imagem');
        imageUrl = uploadData.url;
      }
      const payload = {
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        socialLinks: socialLinks.filter((l) => l.trim() !== ""),
        imageUrl,
        openingHours,
        notes: restaurant.notes,
        ownerId: restaurant.ownerId,
      };
      console.log('Submitting restaurant config:', payload);
      const res = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setRestaurant(data.restaurant);
        setSuccess("Configurações salvas com sucesso!");
        setLogo(null); // Clear logo after upload
      } else {
        setError(data.message || "Erro ao salvar configurações");
      }
    } catch (e: any) {
      setError(e.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-lg">A carregar restaurante...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-5xl mx-auto mt-10">
      {/* Left: Main Form */}
      <div className="flex-1 max-w-lg">
        <h1 className="text-2xl font-bold mb-8 text-center md:text-left">Configurações do Restaurante</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Basic Info */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Restaurante *</label>
            <input
              type="text"
              name="name"
              value={restaurant.name || ""}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
            <input
              type="text"
              name="address"
              value={restaurant.address || ""}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cozinha *</label>
            <select
              name="cuisine"
              value={restaurant.cuisine || ""}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Selecione o tipo de cozinha</option>
              {CUISINE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="description"
              value={restaurant.description || ""}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          {/* Contact Info */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              type="tel"
              name="phone"
              value={restaurant.phone || "912345678"}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={restaurant.email || "restaurante@gmail.com"}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={restaurant.website || "https://www.restaurante.com"}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          {/* Social Links */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Redes Sociais</label>
            {socialLinks.map((link, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="url"
                  value={link || "https://facebook.com/seurestaurante"}
                  onChange={e => handleSocialLinkChange(idx, e.target.value)}
                  placeholder="https://facebook.com/seurestaurante"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                {socialLinks.length > 1 && (
                  <button type="button" onClick={() => removeSocialLink(idx)} className="ml-2 text-red-500 hover:text-red-700">Remover</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSocialLink} className="text-primary underline text-sm mt-1">Adicionar link</button>
          </div>
          {/* Logo Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo / Imagem *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500"
              required={!logoPreview}
            />
            {logoPreview && (
              <img src={logoPreview} alt="Logo preview" className="mt-2 h-20 object-contain" />
            )}
          </div>
          {/* Reservation Settings */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho mínimo da reserva</label>
            <input
              type="number"
              name="minReservationSize"
              value={restaurant.minReservationSize || ""}
              onChange={handleChange}
              min={1}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho máximo da reserva</label>
            <input
              type="number"
              name="maxReservationSize"
              value={restaurant.maxReservationSize || ""}
              onChange={handleChange}
              min={1}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas Especiais</label>
            <textarea
              name="notes"
              value={restaurant.notes || ""}
              onChange={handleChange}
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${saving ? "bg-primary/70" : "bg-primary hover:bg-primary/90 text-white"}`}
          >
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>
          {success && <div className="text-green-600 mt-2">{success}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mt-4"
        >
          ← Voltar
        </button>
      </div>
      {/* Right: Preview + Opening Hours Card */}
      <div className="flex-1 max-w-md flex flex-col gap-8">
        {/* --- Restaurant Card Preview --- */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 w-full">
            <Image
              src={logoPreview || restaurant.imageUrl || '/images/restaurant-placeholder.jpg'}
              alt={restaurant.name || 'Preview'}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{restaurant.name || 'Nome do Restaurante'}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine || 'Tipo de Cozinha'}</p>
            <p className="text-gray-500 text-sm mb-4">{restaurant.address || 'Endereço'}</p>
            <p className="text-gray-600 line-clamp-2">{restaurant.description || 'Descrição do restaurante...'}</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Contacto: {restaurant.phone || 'Não disponível'}</p>
              <p>Email: {restaurant.email || 'Não disponível'}</p>
            </div>
          </div>
        </div>
        {/* --- Opening Hours Card --- */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            Horário de Funcionamento
          </h2>
          <div className="space-y-2">
            {openingHours.map((oh, idx) => (
              <div key={oh.day} className="flex items-center gap-2">
                <span className="w-20">{oh.day}</span>
                <input
                  type="time"
                  value={oh.open}
                  disabled={oh.closed}
                  onChange={e => handleOpeningHourChange(idx, "open", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  required={!oh.closed}
                />
                <span>-</span>
                <input
                  type="time"
                  value={oh.close}
                  disabled={oh.closed}
                  onChange={e => handleOpeningHourChange(idx, "close", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  required={!oh.closed}
                />
                <label className="ml-2 flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={oh.closed}
                    onChange={e => handleOpeningHourChange(idx, "closed", e.target.checked)}
                    className="mr-1"
                  />
                  Fechado
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 