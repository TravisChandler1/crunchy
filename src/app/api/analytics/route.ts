import { NextRequest, NextResponse } from 'next/server';

// Mock analytics data - in real app, this would be calculated from database
const generateMockAnalytics = (days: number) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  // Generate mock revenue by month data
  const revenueByMonth = [];
  for (let i = 0; i < Math.min(days / 30, 12); i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    revenueByMonth.unshift({
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.floor(Math.random() * 500000) + 100000,
      orders: Math.floor(Math.random() * 100) + 20
    });
  }
  
  // Generate peak hours data
  const peakHours = [];
  for (let hour = 0; hour < 24; hour++) {
    peakHours.push({
      hour,
      orders: Math.floor(Math.random() * 20) + (hour >= 11 && hour <= 14 ? 15 : hour >= 18 && hour <= 21 ? 12 : 2)
    });
  }
  
  return {
    totalOrders: Math.floor(Math.random() * 1000) + 200,
    totalRevenue: Math.floor(Math.random() * 2000000) + 500000,
    averageOrderValue: Math.floor(Math.random() * 5000) + 3000,
    customerSatisfaction: 4.2 + Math.random() * 0.6,
    deliveryPerformance: 85 + Math.random() * 10,
    customerRetention: 65 + Math.random() * 20,
    topProducts: [
      { name: 'Ripe Plantain Chips', sales: 150, revenue: 675000 },
      { name: 'Unripe Plantain Chips', sales: 120, revenue: 540000 },
      { name: 'Mixed Pack', sales: 80, revenue: 400000 }
    ],
    revenueByMonth,
    ordersByStatus: [
      { status: 'delivered', count: 180 },
      { status: 'pending', count: 25 },
      { status: 'preparing', count: 15 },
      { status: 'out_for_delivery', count: 10 },
      { status: 'cancelled', count: 5 }
    ],
    peakHours
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const analytics = generateMockAnalytics(days);
    
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}