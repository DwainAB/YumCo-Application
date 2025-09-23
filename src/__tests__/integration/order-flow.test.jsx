import { orderService } from '../../services/orderService';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

describe('Order Flow Integration Tests', () => {
  const mockRestaurantId = 'rest-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full order lifecycle', async () => {
    const newOrderData = {
      restaurant_id: mockRestaurantId,
      items: [
        { product_id: 1, quantity: 2, price: 12.99 },
      ],
      total: 25.98,
      status: 'pending',
    };

    const mockChain = {
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn(),
    };

    supabase.from.mockReturnValue(mockChain);

    mockChain.single.mockResolvedValueOnce({
      data: { id: 1, ...newOrderData },
      error: null,
    });

    const createdOrder = await orderService.createOrder(newOrderData);
    expect(createdOrder.id).toBe(1);
    expect(createdOrder.status).toBe('pending');

    mockChain.single.mockResolvedValueOnce({
      data: { ...createdOrder, status: 'in_progress' },
      error: null,
    });

    const inProgressOrder = await orderService.updateOrderStatus(1, 'in_progress');
    expect(inProgressOrder.status).toBe('in_progress');

    mockChain.single.mockResolvedValueOnce({
      data: { ...createdOrder, status: 'completed' },
      error: null,
    });

    const completedOrder = await orderService.updateOrderStatus(1, 'completed');
    expect(completedOrder.status).toBe('completed');

    mockChain.eq.mockResolvedValueOnce({ error: null });

    await orderService.deleteOrder(1);
    expect(mockChain.delete).toHaveBeenCalled();
  });

  it('should handle order creation with validation errors', async () => {
    await expect(
      orderService.createOrder({ items: [], total: 10 })
    ).rejects.toThrow('Restaurant ID is required');
  });

  it('should filter orders by status correctly', async () => {
    const mockPendingOrders = [
      { id: 1, restaurant_id: mockRestaurantId, status: 'pending' },
      { id: 2, restaurant_id: mockRestaurantId, status: 'pending' },
    ];

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockPendingOrders,
        error: null,
      }),
    };

    supabase.from.mockReturnValue(mockChain);

    const pendingOrders = await orderService.getOrdersByStatus(mockRestaurantId, 'pending');

    expect(pendingOrders).toHaveLength(2);
    expect(pendingOrders.every(order => order.status === 'pending')).toBe(true);
  });
});