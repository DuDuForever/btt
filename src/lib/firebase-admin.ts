
import * as admin from 'firebase-admin';

// IMPORTANT: To enable server-side authentication and data fetching,
// you must generate a service account key from your Firebase project settings.
// 1. Go to Project Settings > Service accounts.
// 2. Click "Generate new private key".
// 3. A JSON file will be downloaded. Copy the ENTIRE content of that file.
// 4. Create a new environment variable named FIREBASE_SERVICE_ACCOUNT_KEY
//    in your .env file and paste the copied JSON content as its value.
//    It should look like: FIREBASE_SERVICE_ACCOUNT_KEY={ ... }

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountJson) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Server-side features will not work.");
        }
        
        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        // We don't re-throw the error here to allow the client-side of the app to potentially still function.
        // Server-side calls will fail gracefully in data.ts.
    }
}

// We conditionally export auth and db to avoid crashes if initialization fails.
let auth, db;
if (admin.apps.length) {
    auth = admin.auth();
    db = admin.firestore();
}

export { auth, db };
