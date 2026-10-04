import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verifies a Google ID token (a signed JWT Google itself issued) and returns its
// payload: { sub, email, email_verified, name, ... }. Throws if the token is
// forged, expired, or wasn't issued for this app's Google Client ID — callers
// must wrap this in try/catch and treat any throw as "not authenticated".
//
// Used by both google login and Google-based account re-authentication (delete
// account for Google-only users), so the trust check lives in exactly one place.
export async function verifyGoogleIdToken(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
}
