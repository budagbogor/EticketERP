import { Ticket } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Car, Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Link } from "react-router-dom";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link to={`/tickets/${ticket.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{ticket.ticketNumber}</p>
              <h3 className="text-base font-medium mt-1">{ticket.customer.name}</h3>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span>{ticket.vehicle.brand} {ticket.vehicle.model} • {ticket.vehicle.plateNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{ticket.branch}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(ticket.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm">
              <span className="font-medium">{ticket.category}</span>
              <span className="text-muted-foreground"> • {ticket.subCategory}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
