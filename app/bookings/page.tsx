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
import { Badge } from "@/components/ui/badge";

type PrimitiveDate = string | number | Date;

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
  createdAt: PrimitiveDate;
  updatedAt: PrimitiveDate;
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

function formatDate(value: PrimitiveDate) {
  if (value instanceof Date) return value.toLocaleString();
  const n = typeof value === "string" ? Date.parse(value) : Number(value);
  // Drizzle with unixepoch() often returns seconds, convert if it looks like seconds
  const ms = !isNaN(n) && n < 10_000_000_000 ? n * 1000 : n; // naive seconds check
  const d = new Date(ms);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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
      <div className="mx-auto p-6 max-w-[120rem]">
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
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Table</TableHead>
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
                            <p className="text-muted-foreground text-xs">{booking.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{booking.restaurant.name}</p>
                            <p className="text-muted-foreground text-xs">{booking.restaurant.cuisine}</p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.bookingDate}</TableCell>
                        <TableCell>{booking.bookingTime}</TableCell>
                        <TableCell>{booking.partySize}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{booking.table.tableNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[20rem] truncate" title={booking.specialRequests ?? undefined}>
                          {booking.specialRequests ?? "—"}
                        </TableCell>
                        <TableCell>{formatDate(booking.createdAt)}</TableCell>
                        <TableCell>{formatDate(booking.updatedAt)}</TableCell>
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
