import { supabase } from '../lib/supabase';

export const orderService = {
  async getOrders(restaurantId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getOrderById(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  },

  async createOrder(orderData) {
    if (!orderData.restaurant_id) {
      throw new Error('Restaurant ID is required');
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId, status) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteOrder(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  },

  async getOrdersByStatus(restaurantId, status) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};