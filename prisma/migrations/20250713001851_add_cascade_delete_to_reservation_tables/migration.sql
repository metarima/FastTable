-- DropForeignKey
ALTER TABLE "ReservationTable" DROP CONSTRAINT "ReservationTable_reservationId_fkey";

-- AddForeignKey
ALTER TABLE "ReservationTable" ADD CONSTRAINT "ReservationTable_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
