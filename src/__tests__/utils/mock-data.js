export const mockRestaurant = {
  id: 1,
  name: 'Test Restaurant',
  restaurantId: 'rest-123',
  address: '123 Test Street',
  phone: '+33123456789',
  email: 'test@restaurant.com',
};

export const mockOwner = {
  id: 1,
  email: 'owner@test.com',
  restaurantId: 'rest-123',
  role: 'owner',
};

export const mockMenu = {
  id: 1,
  nom: 'Menu Test',
  price: 15.99,
  restaurant_id: 'rest-123',
  categories: [
    {
      id: 1,
      nom: 'Entrées',
      options: [
        { id: 1, nom: 'Salade', price: 5.99 },
        { id: 2, nom: 'Soupe', price: 4.99 },
      ],
    },
  ],
};

export const mockProduct = {
  id: 1,
  name: 'Product Test',
  price: 12.99,
  description: 'Test product description',
  category: 'Main',
  restaurant_id: 'rest-123',
  image_url: 'https://example.com/image.jpg',
};

export const mockOrder = {
  id: 1,
  restaurant_id: 'rest-123',
  status: 'pending',
  total: 45.97,
  items: [
    {
      id: 1,
      product_id: 1,
      quantity: 2,
      price: 12.99,
      name: 'Product Test',
    },
  ],
  table_number: 5,
  created_at: '2025-09-23T10:00:00Z',
};

export const mockTable = {
  id: 1,
  table_number: 5,
  restaurant_id: 'rest-123',
  capacity: 4,
  status: 'available',
};

export const mockStats = {
  totalOrders: 150,
  totalRevenue: 3500.50,
  averageOrderValue: 23.34,
  todayOrders: 12,
  todayRevenue: 280.00,
  monthlyRevenue: [
    { month: 'Jan', revenue: 2500 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 3500 },
  ],
  topProducts: [
    { id: 1, name: 'Product 1', orders: 45 },
    { id: 2, name: 'Product 2', orders: 38 },
  ],
};

export const mockReservation = {
  id: 1,
  restaurant_id: 'rest-123',
  customer_name: 'John Doe',
  customer_phone: '+33123456789',
  date: '2025-09-25',
  time: '19:00',
  guests: 4,
  table_id: 1,
  status: 'confirmed',
};