import admin from 'firebase-admin';
import { getFirestore } from '../firestore.js'; // Ensure app is initialized

// Initialize Firebase Admin if not already done (getFirestore does it for Firestore, but we need Auth too)
// We can share the app instance if we export it from firestore.js, or just rely on default app.
// Since getFirestore initializes the default app, admin.auth() should work.

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};
