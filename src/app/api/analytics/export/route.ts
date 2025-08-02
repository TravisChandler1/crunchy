import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate CSV export with real data
const generateCSVExport = async (days: number) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  try {
    // Get all orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Get feedback data
    const feedbackResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/feedback`);
    const feedbacks = feedbackResponse.ok ? await feedbackResponse.json() : [];

    // Create CSV content
    let csvContent = 'Date,Order ID,Customer,Phone,Items,Total,Status,Customer Email,Delivery Address,Delivery Charge\n';
    
    orders.forEach(order => {
      try {
        const orderData = JSON.parse(order.items as string);
        const date = new Date(order.date).toLocaleDateString();
        const items = orderData.items ? orderData.items.map((item: any) => `${item.name} x${item.quantity}`).join('; ') : '';
        const total = orderData.total || 0;
        const status = order.status || 'delivered';
        const email = orderData.email || '';
        const deliveryAddress = orderData.delivery?.isDelivery ? orderData.delivery.address : 'Store Pickup';
        const deliveryCharge = orderData.delivery?.deliveryCharge || 0;
        
        // Escape commas and quotes in CSV
        const escapeCsv = (str: string) => {
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        csvContent += `${date},${order.id},${escapeCsv(order.customer)},${order.phone},${escapeCsv(items)},${total},${status},${email},${escapeCsv(deliveryAddress)},${deliveryCharge}\n`;
      } catch (error) {
        console.error('Error processing order for export:', error);
      }
    });

    // Add feedback summary
    csvContent += '\n\nFeedback Summary\n';
    csvContent += 'Date,Customer,Rating,Category,Comment,Verified\n';
    
    feedbacks.forEach((feedback: any) => {
      const date = new Date(feedback.timestamp).toLocaleDateString();
      const escapeCsv = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      csvContent += `${date},${escapeCsv(feedback.customerName)},${feedback.rating},${feedback.category},${escapeCsv(feedback.comment)},${feedback.verified ? 'Yes' : 'No'}\n`;
    });

    // Add analytics summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      try {
        const orderData = JSON.parse(order.items as string);
        return sum + (orderData.total || 0);
      } catch {
        return sum;
      }
    }, 0);
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgRating = feedbacks.length > 0 ? feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbacks.length : 0;

    csvContent += '\n\nSummary Statistics\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Orders,${totalOrders}\n`;
    csvContent += `Total Revenue,₦${totalRevenue.toLocaleString()}\n`;
    csvContent += `Average Order Value,₦${Math.round(avgOrderValue).toLocaleString()}\n`;
    csvContent += `Average Rating,${avgRating.toFixed(1)}/5\n`;
    csvContent += `Date Range,${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}\n`;

    return csvContent;
  } catch (error) {
    console.error('Error generating CSV export:', error);
    throw error;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const csvContent = await generateCSVExport(days);
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="crunchy-cruise-analytics-${days}days.csv"`
      }
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 });
  }
}