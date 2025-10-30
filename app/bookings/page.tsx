"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BookingWithDetails = {
  id: number;
  restaurantId: number;
  tableId: number;
  customerId: number;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  status: string;
  specialRequests: string | null;
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  restaurant: {
    id?: number;
    name: string;
    cuisine: string;
  };
  table: {
    id?: number;
    tableNumber: string;
    capacity: number;
  };
  customer: {
    id?: number;
    name: string;
    email: string;
    phone: string;
  };
};

function formatDateTime(value: BookingWithDetails["createdAt"]) {
  try {
    if (value instanceof Date) {
      return value.toISOString().replace("T", " ").slice(0, 19);
    }
    if (typeof value === "number") {
      // If seconds precision, convert to ms
      const ms = value < 1e12 ? value * 1000 : value;
      return new Date(ms).toISOString().replace("T", " ").slice(0, 19);
    }
    // string
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toISOString().replace("T", " ").slice(0, 19);
    }
    return String(value);
  } catch {
    return String(value);
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = (await response.json()) as { bookings: BookingWithDetails[] };
      setBookings(data.bookings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto p-6 max-w-[1400px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <p className="text-muted-foreground">Manage and view all restaurant reservations</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              Complete list of all restaurant reservations with database columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Booking Status Descriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 whitespace-nowrap min-w-[90px]">
                    confirmed
                  </span>
                  <p className="text-muted-foreground flex-1">
                    Active, awaiting customer arrival
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 whitespace-nowrap min-w-[90px]">
                    completed
                  </span>
                  <p className="text-muted-foreground flex-1">
                    Successfully finished dining
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 whitespace-nowrap min-w-[90px]">
                    cancelled
                  </span>
                  <p className="text-muted-foreground flex-1">
                    Cancelled by customer/restaurant
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 whitespace-nowrap min-w-[90px]">
                    no-show
                  </span>
                  <p className="text-muted-foreground flex-1">
                    Customer did not arrive
                  </p>
                </div>
              </div>
            </div>
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bookings found</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Restaurant ID</TableHead>
                      <TableHead>Table ID</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Special Requests</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{booking.restaurantId}</TableCell>
                        <TableCell>{booking.tableId}</TableCell>
                        <TableCell>{booking.customerId}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{booking.customer.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {booking.customer.email}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {booking.customer.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{booking.restaurant.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {booking.restaurant.cuisine}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">#{booking.table.tableNumber}</p>
                            <p className="text-muted-foreground text-xs">
                              capacity: {booking.table.capacity}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.bookingDate}</TableCell>
                        <TableCell>{booking.bookingTime}</TableCell>
                        <TableCell>{booking.partySize}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[250px] whitespace-pre-wrap">
                          {booking.specialRequests || "-"}
                        </TableCell>
                        <TableCell>{formatDateTime(booking.createdAt)}</TableCell>
                        <TableCell>{formatDateTime(booking.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
