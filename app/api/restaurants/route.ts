import { NextRequest, NextResponse } from "next/server";
import { getDb, restaurants as restaurantsTable, openingHours, tables } from "@/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const db = getDb(env.DB);
  
  try {
    // Fetch current restaurants
    const restaurantList = await db.query.restaurants.findMany({
      orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
    });

    // If empty DB (e.g., fresh environment), seed with defaults including a 4th restaurant
    if (restaurantList.length === 0) {
      await seedDefaultData(db);

      const refreshed = await db.query.restaurants.findMany({
        orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
      });
      return NextResponse.json({ restaurants: refreshed });
    }

    // If fewer than 4 restaurants exist, add a fourth (idempotent by name)
    if (restaurantList.length < 4) {
      const alreadyHasGreenGarden = restaurantList.some(
        (r) => r.name === "The Green Garden"
      );
      if (!alreadyHasGreenGarden) {
        await seedSingleRestaurant(db);
        const refreshed = await db.query.restaurants.findMany({
          orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
        });
        return NextResponse.json({ restaurants: refreshed });
      }
    }

    return NextResponse.json({ restaurants: restaurantList });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

async function seedDefaultData(db: any) {
  const demoRestaurants = [
    {
      name: "The Italian Corner",
      description: "Authentic Italian cuisine in a cozy atmosphere",
      address: "123 Main St, San Francisco, CA 94102",
      phone: "(415) 555-0101",
      email: "info@italiancorner.com",
      cuisine: "Italian",
      priceRange: "$$$",
      imageUrl: null as string | null,
    },
    {
      name: "Sakura Sushi",
      description: "Fresh sushi and sashimi crafted by expert chefs",
      address: "742 Market St, San Francisco, CA 94103",
      phone: "(415) 555-0142",
      email: "hello@sakurasushi.com",
      cuisine: "Japanese",
      priceRange: "$$$",
      imageUrl: null as string | null,
    },
    {
      name: "El Camino Taqueria",
      description: "Vibrant Mexican flavors with street-food favorites",
      address: "88 Mission St, San Francisco, CA 94105",
      phone: "(415) 555-0199",
      email: "contact@elcaminotaqueria.com",
      cuisine: "Mexican",
      priceRange: "$$",
      imageUrl: null as string | null,
    },
    {
      name: "The Green Garden",
      description: "Seasonal vegetarian and vegan dishes with local produce",
      address: "501 Castro St, San Francisco, CA 94114",
      phone: "(415) 555-0167",
      email: "reservations@greengarden.com",
      cuisine: "Vegetarian",
      priceRange: "$$$",
      imageUrl: null as string | null,
    },
  ];

  await db.insert(restaurantsTable).values(demoRestaurants);

  // Fetch inserted restaurants to obtain their IDs
  const inserted = await db.query.restaurants.findMany();

  // Seed opening hours: Mon-Sat 11:00-22:00, Sun closed
  const allOpeningHours = inserted.flatMap((r: { id: number }) =>
    Array.from({ length: 7 }, (_, day) => ({
      restaurantId: r.id,
      dayOfWeek: day,
      openTime: day === 0 ? "00:00" : "11:00",
      closeTime: day === 0 ? "00:00" : "22:00",
      isClosed: day === 0,
    }))
  );

  if (allOpeningHours.length > 0) {
    await db.insert(openingHours).values(allOpeningHours);
  }

  // Seed tables for each restaurant
  const baseTables = [
    { tableNumber: "T1", capacity: 2 },
    { tableNumber: "T2", capacity: 2 },
    { tableNumber: "T3", capacity: 4 },
    { tableNumber: "T4", capacity: 4 },
    { tableNumber: "T5", capacity: 6 },
    { tableNumber: "T6", capacity: 8 },
  ];

  for (const r of inserted) {
    const values = baseTables.map((t) => ({ ...t, restaurantId: r.id }));
    await db.insert(tables).values(values);
  }
}

async function seedSingleRestaurant(db: any) {
  const newRestaurant = {
    name: "The Green Garden",
    description: "Seasonal vegetarian and vegan dishes with local produce",
    address: "501 Castro St, San Francisco, CA 94114",
    phone: "(415) 555-0167",
    email: "reservations@greengarden.com",
    cuisine: "Vegetarian",
    priceRange: "$$$",
    imageUrl: null as string | null,
  };

  await db.insert(restaurantsTable).values(newRestaurant);

  const [inserted] = await db.query.restaurants.findMany({
    where: (r, { eq }) => eq(r.name, newRestaurant.name),
    limit: 1,
  });

  if (!inserted) return;

  const hours = Array.from({ length: 7 }, (_, day) => ({
    restaurantId: inserted.id,
    dayOfWeek: day,
    openTime: day === 0 ? "00:00" : "11:00",
    closeTime: day === 0 ? "00:00" : "22:00",
    isClosed: day === 0,
  }));
  await db.insert(openingHours).values(hours);

  const values = [
    { tableNumber: "T1", capacity: 2 },
    { tableNumber: "T2", capacity: 2 },
    { tableNumber: "T3", capacity: 4 },
    { tableNumber: "T4", capacity: 4 },
    { tableNumber: "T5", capacity: 6 },
    { tableNumber: "T6", capacity: 8 },
  ].map((t) => ({ ...t, restaurantId: inserted.id }));
  await db.insert(tables).values(values);
}

