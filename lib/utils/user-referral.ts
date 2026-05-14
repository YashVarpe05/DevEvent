import { cookies } from "next/headers";

const USER_REFERRAL_COOKIE_NAME = "dev_event_uref";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function generateUserReferralLink(eventId: string, referrerId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devevents.dev";
    return `${baseUrl}/events/${eventId}?uref=${referrerId}`;
}

export async function setUserReferralCookie(referrerId: string, eventId: string) {
    const cookieStore = await cookies();
    cookieStore.set(USER_REFERRAL_COOKIE_NAME, `${referrerId}:${eventId}`, {
        maxAge: COOKIE_MAX_AGE,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
}

export async function getUserReferralCookie(): Promise<{ referrerId: string; eventId: string } | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(USER_REFERRAL_COOKIE_NAME);
    if (!cookie?.value) return null;

    const [referrerId, eventId] = cookie.value.split(":");
    if (!referrerId || !eventId) return null;

    return { referrerId, eventId };
}

export async function clearUserReferralCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(USER_REFERRAL_COOKIE_NAME);
}
