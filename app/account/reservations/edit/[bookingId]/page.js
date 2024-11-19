import SubmitButton from "@/app/_components/SubmitButton";
import { updateBooking } from "@/app/_lib/actions";
import { getBooking, getBookings, getCabin } from "@/app/_lib/data-service";

/* export async function generateMetadata({ params }) {
  const { name } = await getBooking(params.reservationId);
  return {
    title: `Edit Reservation ${name}`,
  };
}

export async function generateStaticParams() {
  const reservations = await getBookings();
  const ids = reservations.map((reservation) => ({
    reservationId: String(reservation.id),
  }));
  return ids;
}
 */
export default async function Page({ params }) {
  // CHANGE
  /* const reservationId = 244;
  const maxCapacity = 23; */
  // console.log("params:", params);
  const { bookingId } = params;

  const { numGuests, observations, cabinId } = await getBooking(bookingId);
  const cabin = await getCabin(cabinId);
  // console.log(cabin);
  const maxCapacity = cabin.maxCapacity;
  // console.log(maxCapacity);
  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{bookingId}
      </h2>

      <form
        className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
        action={updateBooking}
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            defaultValue={numGuests}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            defaultValue={observations}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          <SubmitButton pendingLabel="Updating...">
            Update Reservation
          </SubmitButton>
        </div>
        <input type="hidden" name="bookingId" value={bookingId} />
      </form>
    </div>
  );
}
