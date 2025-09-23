import { orderService } from '../orderService';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should fetch orders for a restaurant', async () => {
      const mockOrders = [
        { id: 1, restaurant_id: 'rest-123', status: 'pending' },
        { id: 2, restaurant_id: 'rest-123', status: 'completed' },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      supabase.from.mockReturnValue(mockChain);

      const result = await orderService.getOrders('rest-123');

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(mockChain.eq).toHaveBeenCalledWith('restaurant_id', 'rest-123');
      expect(result).toEqual(mockOrders);
    });

    it('should throw error if restaurant ID is not provided', async () => {
      await expect(orderService.getOrders()).rejects.toThrow('Restaurant ID is required');
    });

    it('should throw error if supabase returns error', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        }),
      };

      supabase.from.mockReturnValue(mockChain);

      await expect(orderService.getOrders('rest-123')).rejects.toEqual({
        message: 'Database error'
      });
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const newOrder = {
        restaurant_id: 'rest-123',
        items: [],
        total: 45.99,
        status: 'pending',
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 1, ...newOrder },
          error: null
        }),
      };

      supabase.from.mockReturnValue(mockChain);

      const result = await orderService.createOrder(newOrder);

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(mockChain.insert).toHaveBeenCalledWith([newOrder]);
      expect(result).toEqual({ id: 1, ...newOrder });
    });

    it('should throw error if restaurant ID is missing', async () => {
      await expect(
        orderService.createOrder({ items: [], total: 10 })
      ).rejects.toThrow('Restaurant ID is required');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 1, status: 'completed' },
          error: null
        }),
      };

      supabase.from.mockReturnValue(mockChain);

      const result = await orderService.updateOrderStatus(1, 'completed');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'completed' });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 1);
      expect(result.status).toBe('completed');
    });

    it('should throw error for invalid status', async () => {
      await expect(
        orderService.updateOrderStatus(1, 'invalid_status')
      ).rejects.toThrow('Invalid order status');
    });

    it('should throw error if order ID is not provided', async () => {
      await expect(
        orderService.updateOrderStatus(null, 'completed')
      ).rejects.toThrow('Order ID is required');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      supabase.from.mockReturnValue(mockChain);

      await orderService.deleteOrder(1);

      expect(supabase.from).toHaveBeenCalledWith('orders');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should throw error if order ID is not provided', async () => {
      await expect(orderService.deleteOrder()).rejects.toThrow('Order ID is required');
    });
  });

  describe('getOrdersByStatus', () => {
    it('should fetch orders by status', async () => {
      const mockOrders = [
        { id: 1, restaurant_id: 'rest-123', status: 'pending' },
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
      };

      supabase.from.mockReturnValue(mockChain);

      const result = await orderService.getOrdersByStatus('rest-123', 'pending');

      expect(mockChain.eq).toHaveBeenCalledWith('restaurant_id', 'rest-123');
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'pending');
      expect(result).toEqual(mockOrders);
    });
  });
});