"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  // console.log(formData);
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in to update your profile");
  }
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
    throw new Error("please provide a valid national ID");
  }
  const updateData = { nationality, countryFlag, nationalID };
  //console.log(updateDate);
  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }
  revalidatePath("/account/profile");
}
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
export async function createBooking(bookingData, formData) {
  console.log(bookingData, formData);
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in to create a reservation");
  }

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };
  //console.log(newBooking);
  const { error } = await supabase.from("bookings").insert([newBooking]);
  if (error) {
    throw new Error("Booking could not be created");
  }
  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}
export async function deleteBooking(bookingId) {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in to delete a reservation");
  }
  const guestBookings = await getBookings(session.user.guestId);
  const bookingIds = guestBookings.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId)) {
    throw new Error("You are not authorized to delete this reservation");
  }
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);
  if (error) {
    throw new Error("Booking could not be deleted");
  }
  revalidatePath("/account/reservations");
}
export async function updateBooking(formData) {
  // 1 检查用户是否登录
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in to update a reservation");
  }
  // 2 检查用户是否有权限更新该预订
  const bookingId = Number(formData.get("bookingId"));
  const guestBookings = await getBookings(session.user.guestId);
  const bookingIds = guestBookings.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId)) {
    throw new Error("You are not authorized to update this reservation");
  }
  // 3 使用 FormData.get() 方法获取值
  //const reservationId = formData.get("reservationId");
  const numGuests = Number(formData.get("numGuests"));
  const observations = formData.get("observations").slice(0, 1000);
  const updateData = { numGuests, observations };
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);
  if (error) {
    throw new Error("Reservation could not be updated");
  }
  // 4 重新验证路径
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath(`/account/reservations`);
  // 5 重定向
  redirect(`/account/reservations`);
}
