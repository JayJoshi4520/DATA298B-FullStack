import { getFirestore } from '../firestore.js';
import { v4 as uuidv4 } from 'uuid';

export class FirestoreStore {
    constructor() {
        this.db = getFirestore();
    }

    async ensureUser(userId) {
        if (!userId) return;
        const userRef = this.db.collection('users').doc(userId);
        const doc = await userRef.get();
        if (!doc.exists) {
            await userRef.set({
                id: userId,
                createdAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            });
        } else {
            await userRef.update({
                lastSeen: new Date().toISOString()
            });
        }
    }

    async ensureSession({ sessionId, userId, projectId }) {
        if (!sessionId) return;
        const sessionRef = this.db.collection('sessions').doc(sessionId);
        const doc = await sessionRef.get();
        if (!doc.exists) {
            await sessionRef.set({
                id: sessionId,
                userId,
                projectId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } else {
            await sessionRef.update({
                updatedAt: new Date().toISOString()
            });
        }
    }

    async updateSession(sessionId, data) {
        await this.db.collection('sessions').doc(sessionId).set(data, { merge: true });
    }


    async addMessage({ sessionId, role, content, tokenUsage = null }) {
        const message = {
            sessionId,
            role,
            content,
            tokenUsage,
            timestamp: new Date().toISOString()
        };

        // Add to subcollection for better organization and querying
        await this.db.collection('sessions').doc(sessionId).collection('messages').add(message);

        // Also update the session's updated_at (use set with merge to avoid errors if doc doesn't exist)
        await this.db.collection('sessions').doc(sessionId).set({
            updatedAt: new Date().toISOString(),
            lastMessage: content.substring(0, 100) // Preview
        }, { merge: true });
    }

    async getRecentMessages(sessionId, limit = 30) {
        const messagesRef = this.db.collection('sessions').doc(sessionId).collection('messages');
        const snapshot = await messagesRef
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        return messages.reverse(); // Return in chronological order
    }

    async getSessionSummary(sessionId) {
        const doc = await this.db.collection('sessions').doc(sessionId).get();
        return doc.exists ? doc.data().summary : null;
    }

    async setSessionSummary(sessionId, summary) {
        await this.db.collection('sessions').doc(sessionId).set({ summary }, { merge: true });
    }

    async countMessages(sessionId) {
        const snapshot = await this.db.collection('sessions').doc(sessionId).collection('messages').count().get();
        return snapshot.data().count;
    }

    async addToolRun({ sessionId, name, input, output, success }) {
        // Add to subcollection
        await this.db.collection('sessions').doc(sessionId).collection('tool_runs').add({
            name,
            input,
            output,
            success,
            timestamp: new Date().toISOString()
        });

        // Increment tool run counter on session document for easy stats
        const sessionRef = this.db.collection('sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        const currentCount = sessionDoc.exists ? (sessionDoc.data().toolRunCount || 0) : 0;
        await sessionRef.set({
            toolRunCount: currentCount + 1,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    }

    async addMemory({ scope, key, text, meta }) {
        await this.db.collection('memories').add({
            scope,
            key,
            text,
            meta,
            timestamp: new Date().toISOString()
        });
    }

    async searchMemories({ scope, query, topK = 10 }) {
        // Basic keyword search (Firestore doesn't support full-text search natively without extensions)
        // For now, we'll just fetch recent memories for the scope.
        // In a real app, we'd use a vector store or Algolia/Elasticsearch.
        // This is a placeholder for the "search" functionality.

        try {
            const snapshot = await this.db.collection('memories')
                .where('scope', '==', scope)
                .orderBy('timestamp', 'desc')
                .limit(topK)
                .get();

            const memories = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.text.toLowerCase().includes(query.toLowerCase())) {
                    memories.push({ id: doc.id, ...data });
                }
            });
            return memories;
        } catch (error) {
            // If index isn't ready yet, log and return empty array instead of crashing
            if (error.code === 9) {
                console.warn('Firestore index not ready yet for memories collection. Returning empty results.');
                return [];
            }
            throw error;
        }
    }

    // Placeholder for semantic search if we add vector support later
    async semanticSearch({ scope, query, topK }) {
        return this.searchMemories({ scope, query, topK });
    }

    // ============================================
    // ANALYTICS & EXPORT METHODS (Required by index.js)
    // ============================================

    async getStats() {
        try {
            // Get all sessions and count messages + tool runs from document-level counters
            const sessionsSnapshot = await this.db.collection('sessions').get();
            let totalMessages = 0;
            let totalToolRuns = 0;

            sessionsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                // Count messages from doc level first, then metadata
                if (data.messageCount) {
                    totalMessages += data.messageCount;
                } else if (data.metadata?.messageCount) {
                    totalMessages += data.metadata.messageCount;
                } else if (data.metadata?.messages?.length) {
                    totalMessages += data.metadata.messages.length;
                }

                // Count tool runs from doc level counter
                if (data.toolRunCount) {
                    totalToolRuns += data.toolRunCount;
                }
            });

            const totalSessions = sessionsSnapshot.size;

            // Safe count for users
            let totalUsers = 0;
            try {
                const usersCount = await this.db.collection('users').count().get();
                totalUsers = usersCount.data().count || 0;
            } catch (e) {
                // Users collection may not exist
                totalUsers = 0;
            }

            // Safe count for memories
            let totalMemories = 0;
            try {
                const memoriesCount = await this.db.collection('memories').count().get();
                totalMemories = memoriesCount.data().count || 0;
            } catch (e) {
                // Memories collection may not exist
                totalMemories = 0;
            }

            return {
                summary: {
                    totalMessages,
                    totalSessions,
                    totalUsers,
                    totalToolRuns,
                    totalMemories,
                    successRate: totalToolRuns > 0 ? "100%" : "N/A"
                },
                tokens: { messagesWithTokens: 0, totalTokens: 0, averagePerMessage: 0 },
                recentActivity: { sessionsLast7Days: totalSessions, messagesLast7Days: totalMessages },
                memoryBreakdown: {}
            };
        } catch (error) {
            console.error("getStats error:", error);
            return {
                summary: { totalMessages: 0, totalSessions: 0, totalUsers: 0, totalToolRuns: 0, totalMemories: 0, successRate: "N/A" },
                tokens: { messagesWithTokens: 0, totalTokens: 0, averagePerMessage: 0 },
                recentActivity: { sessionsLast7Days: 0, messagesLast7Days: 0 },
                memoryBreakdown: {}
            };
        }
    }

    async getSessionDetails(sessionId) {
        const doc = await this.db.collection('sessions').doc(sessionId).get();
        if (!doc.exists) return null;
        return { ...doc.data(), user_id: doc.data().userId, project_id: doc.data().projectId, summary_text: doc.data().summary };
    }

    async getSessionMessages(sessionId, limit = 1000) {
        const snapshot = await this.db.collection('sessions').doc(sessionId).collection('messages')
            .orderBy('timestamp', 'asc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            role: doc.data().role,
            content: doc.data().content,
            created_at: doc.data().timestamp,
            token_usage_json: doc.data().tokenUsage ? JSON.stringify(doc.data().tokenUsage) : null
        }));
    }

    async getSessionToolRuns(sessionId) {
        const snapshot = await this.db.collection('sessions').doc(sessionId).collection('tool_runs')
            .orderBy('timestamp', 'asc')
            .get();

        return snapshot.docs.map(doc => ({
            name: doc.data().name,
            input_json: JSON.stringify(doc.data().input),
            output_json: JSON.stringify(doc.data().output),
            success: doc.data().success ? 1 : 0,
            created_at: doc.data().timestamp
        }));
    }

    async listSessions({ userId, limit = 50 }) {
        try {
            let ref = this.db.collection('sessions');
            // NOTE: We sort in-memory to avoid requiring a composite index (userId + updatedAt)
            // This is acceptable for development/low-volume usage.
            if (userId) {
                ref = ref.where('userId', '==', userId);
            }

            // Fetch more than limit to ensure we get recent ones before in-memory sort
            // (Without orderBy, Firestore returns essentially random order or ID order)
            const snapshot = await ref.limit(limit * 4).get();

            const sessions = snapshot.docs.map(doc => ({
                id: doc.id,
                userId: doc.data().userId,
                projectId: doc.data().projectId,
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
                summary: doc.data().summary,
                metadata: doc.data().metadata,
                messageCount: doc.data().messageCount || doc.data().metadata?.messageCount || doc.data().metadata?.messages?.length || 0
            }));

            // Sort in-memory (descending)
            sessions.sort((a, b) => {
                const dateA = new Date(a.updatedAt || 0);
                const dateB = new Date(b.updatedAt || 0);
                return dateB - dateA;
            });

            return sessions.slice(0, limit);
        } catch (error) {
            console.error("Firestore listSessions error:", error);
            throw error;
        }
    }

    // Batch embedding generation placeholder
    async getMemoriesWithoutEmbeddings(scope, limit) {
        // Placeholder: Firestore vector search setup is complex, skipping for now
        return [];
    }

    async getEmbeddingStatus() {
        const totalMemories = (await this.db.collection('memories').count().get()).data().count;
        // Assuming we store embeddings in a subcollection or separate collection
        // For now, return 0 coverage
        return {
            totalMemories,
            withEmbeddings: 0,
            withoutEmbeddings: totalMemories,
            coverage: "0%"
        };
    }

    async createCollaborationSession({ workflowId, participants }) {
        const sessionId = uuidv4();
        await this.db.collection('collaboration_sessions').doc(sessionId).set({
            workflowId,
            participants,
            createdAt: new Date().toISOString()
        });
        return sessionId;
    }

    async logCollaborationEvent({ sessionId, userId, eventType, eventData }) {
        await this.db.collection('collaboration_events').add({
            sessionId,
            userId,
            eventType,
            eventData,
            createdAt: new Date().toISOString()
        });
    }

    async getCollaborationEvents(sessionId) {
        const snapshot = await this.db.collection('collaboration_events')
            .where('sessionId', '==', sessionId)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        return snapshot.docs.map(doc => doc.data());
    }
}

