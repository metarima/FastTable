"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditRestaurant() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/restaurants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data.restaurant);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar restaurante");
        setLoading(false);
      });
  }, [id]);

  const handleTogglePublished = async () => {
    if (!restaurant) return;
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          ownerId: restaurant.ownerId,
          published: !restaurant.published,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRestaurant(data.restaurant);
        setSuccess(
          data.restaurant.published
            ? "Restaurante publicado com sucesso!"
            : "Restaurante despublicado."
        );
      } else {
        setError(data.message || "Erro ao atualizar restaurante");
      }
    } catch (e) {
      setError("Erro ao atualizar restaurante");
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar Restaurante</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <div className="text-lg font-semibold text-gray-900">{restaurant.name}</div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <div className="text-gray-700">{restaurant.address}</div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário</label>
          <div className="text-gray-700">{restaurant.owner?.name || "N/A"} ({restaurant.owner?.email})</div>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <span className="block text-sm font-medium text-gray-700">Publicado:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded font-semibold ${restaurant.published ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
            {restaurant.published ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Sim
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Não
              </>
            )}
          </span>
          <button
            onClick={handleTogglePublished}
            disabled={saving}
            className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-colors ${restaurant.published ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"} ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {restaurant.published ? "Despublicar" : "Publicar"}
          </button>
        </div>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
      <button
        onClick={() => router.back()}
        className="text-primary hover:underline"
      >
        ← Voltar
      </button>
    </div>
  );
} 