import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate real analytics from database
const calculateRealAnalytics = async (days: number) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  try {
    // Get all orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        date: {
          gte: startDate
        }
      }
    });

    // Get all products
    const products = await prisma.product.findMany();

    // Get all feedback for customer satisfaction
    const feedbackResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/feedback`);
    const feedbacks = feedbackResponse.ok ? await feedbackResponse.json() : [];

    // Calculate basic metrics
    const totalOrders = orders.length;
    let totalRevenue = 0;
    const ordersByStatus: { [key: string]: number } = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };
    
    const productSales: { [key: string]: { sales: number; revenue: number } } = {};
    const hourlyOrders: { [key: number]: number } = {};
    const monthlyData: { [key: string]: { revenue: number; orders: number } } = {};

    // Initialize hourly orders (0-23 hours)
    for (let i = 0; i < 24; i++) {
      hourlyOrders[i] = 0;
    }

    // Process each order
    orders.forEach(order => {
      try {
        const orderData = JSON.parse(order.items as string);
        const orderTotal = orderData.total || 0;
        totalRevenue += orderTotal;

        // Count orders by status (default to 'delivered' for completed orders)
        const status = order.status || 'delivered';
        if (ordersByStatus.hasOwnProperty(status)) {
          ordersByStatus[status]++;
        } else {
          ordersByStatus['delivered']++;
        }

        // Track hourly orders
        const orderHour = new Date(order.date).getHours();
        hourlyOrders[orderHour]++;

        // Track monthly data
        const orderMonth = new Date(order.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[orderMonth]) {
          monthlyData[orderMonth] = { revenue: 0, orders: 0 };
        }
        monthlyData[orderMonth].revenue += orderTotal;
        monthlyData[orderMonth].orders++;

        // Track product sales
        if (orderData.items && Array.isArray(orderData.items)) {
          orderData.items.forEach((item: any) => {
            const productName = item.name;
            if (!productSales[productName]) {
              productSales[productName] = { sales: 0, revenue: 0 };
            }
            productSales[productName].sales += item.quantity;
            productSales[productName].revenue += (item.price * item.quantity);
          });
        }
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate customer satisfaction from feedback
    let customerSatisfaction = 0;
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum: number, feedback: any) => sum + (feedback.rating || 0), 0);
      customerSatisfaction = totalRating / feedbacks.length;
    }

    // Calculate delivery performance (percentage of delivered orders)
    const deliveredOrders = ordersByStatus.delivered || 0;
    const deliveryPerformance = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    // Calculate customer retention (simplified - customers with more than 1 order)
    const customerEmails = new Set();
    const returningCustomers = new Set();
    orders.forEach(order => {
      try {
        const orderData = JSON.parse(order.items as string);
        const email = orderData.email;
        if (email) {
          if (customerEmails.has(email)) {
            returningCustomers.add(email);
          } else {
            customerEmails.add(email);
          }
        }
      } catch (error) {
        console.error('Error processing customer data:', error);
      }
    });
    const customerRetention = customerEmails.size > 0 ? (returningCustomers.size / customerEmails.size) * 100 : 0;

    // Format top products
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: data.revenue
      }));

    // Format revenue by month (last 6 months)
    const revenueByMonth = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6)
      .map(([month, data]) => ({
        month: month.split(' ')[0], // Just the month abbreviation
        revenue: data.revenue,
        orders: data.orders
      }));

    // Format orders by status
    const ordersByStatusArray = Object.entries(ordersByStatus)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count
      }));

    // Format peak hours
    const peakHours = Object.entries(hourlyOrders)
      .map(([hour, orders]) => ({
        hour: parseInt(hour),
        orders
      }));

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue),
      customerSatisfaction: Math.round(customerSatisfaction * 10) / 10, // Round to 1 decimal
      deliveryPerformance: Math.round(deliveryPerformance),
      customerRetention: Math.round(customerRetention),
      topProducts,
      revenueByMonth,
      ordersByStatus: ordersByStatusArray,
      peakHours
    };

  } catch (error) {
    console.error('Error calculating analytics:', error);
    
    // Return fallback data if database query fails
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      customerSatisfaction: 0,
      deliveryPerformance: 0,
      customerRetention: 0,
      topProducts: [],
      revenueByMonth: [],
      ordersByStatus: [],
      peakHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0 }))
    };
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const analytics = await calculateRealAnalytics(days);
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}