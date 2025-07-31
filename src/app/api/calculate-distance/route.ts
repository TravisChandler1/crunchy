import { NextRequest, NextResponse } from 'next/server';

// Store coordinates - 2 Academy Ajinde Rd, estate akala express, Oluyole, Ibadan
const STORE_COORDINATES = { lat: 7.3775, lng: 3.9470 };

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate delivery charge based on distance
function calculateDeliveryCharge(distance: number): number {
  if (distance <= 2.5) return 2000;
  if (distance <= 5) return 3000;
  if (distance <= 10) return 4000;
  if (distance <= 20) return 5000;
  return 5000; // For distances over 20km, use the highest tier
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const distance = calculateDistance(
      STORE_COORDINATES.lat,
      STORE_COORDINATES.lng,
      lat,
      lng
    );

    const deliveryCharge = calculateDeliveryCharge(distance);

    return NextResponse.json({
      distance: Math.round(distance * 100) / 100,
      deliveryCharge,
      storeLocation: STORE_COORDINATES
    });

  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}