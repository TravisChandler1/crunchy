import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // Generate CSV data
    const csvData = [
      ['Date', 'Orders', 'Revenue', 'Average Order Value'],
      ['2024-01-01', '25', '112500', '4500'],
      ['2024-01-02', '30', '135000', '4500'],
      ['2024-01-03', '22', '99000', '4500'],
      // Add more mock data as needed
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${days}days.csv"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 });
  }
}