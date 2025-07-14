import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const RestaurantClientPage = dynamic(() => import('./ClientPage'), { ssr: false });

async function getRestaurant(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/restaurants/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.restaurant || null;
}

async function getMenuItems(restaurantId: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/restaurants/${restaurantId}/menu`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.menu || [];
}

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = await getRestaurant(params.id);
  if (!restaurant) return notFound();
  const menuItems = await getMenuItems(restaurant.id);
  const menuColor = restaurant.menuThemeColor || '#2563eb';

  // Group menu items by category
  const menuByCategory: Record<string, any[]> = {};
  for (const item of menuItems) {
    const cat = item.category || 'Outros';
    if (!menuByCategory[cat]) menuByCategory[cat] = [];
    menuByCategory[cat].push(item);
  }

  return <RestaurantClientPage restaurant={restaurant} menuByCategory={menuByCategory} menuColor={menuColor} />;
} 