
"use client"

// IMPORTANT: All data operations are now client-side.
// This ensures that Firestore security rules are applied directly
// based on the logged-in user's authentication state.

import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    query, 
    orderBy,
    where,
    runTransaction,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type { Client, Visit, ClientWrite, VisitWrite, PremiumRequest, PremiumRequestWrite } from "./types";
import { db, auth } from "./firebase"; // Use the client-side firebase app instance

const getCurrentUser = (): User | null => {
    return auth.currentUser;
}

// Helper to deserialize dates and sort visits
const deserializeClient = (id: string, data: any): Client => {
    const clientData = {
        name: data.name || '',
        phone: data.phone || '',
        displayId: data.displayId || '0000',
        ...data,
        id,
        visits: (data.visits || [])
            .map((v: any) => ({ ...v, date: new Date(v.date), nextVisit: v.nextVisit ? new Date(v.nextVisit) : null }))
            .sort((a: Visit, b: Visit) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    } as Client;
    return clientData;
}


export async function getClients(): Promise<Client[]> {
    const user = getCurrentUser();
    if (!user) return [];
    
    try {
        const clientsCol = collection(db, 'users', user.uid, 'clients');
        const q = query(clientsCol, orderBy("displayId", "desc"));
        const clientSnapshot = await getDocs(q);
        const clientList = clientSnapshot.docs.map(doc => deserializeClient(doc.id, doc.data()));
        return JSON.parse(JSON.stringify(clientList));
    } catch (error) {
        console.error("Error fetching clients:", error);
        throw new Error("Could not fetch clients.");
    }
}

export async function getClient(id: string): Promise<Client | undefined> {
    const user = getCurrentUser();
    if (!user) return undefined;

    try {
        const clientRef = doc(db, 'users', user.uid, 'clients', id);
        const clientSnap = await getDoc(clientRef);

        if (clientSnap.exists()) {
            const client = deserializeClient(clientSnap.id, clientSnap.data());
            return JSON.parse(JSON.stringify(client));
        } else {
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching client:", error);
        throw new Error("Could not fetch client");
    }
}

export async function addClient({ name, phone }: { name: string, phone: string }): Promise<Client> {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const metadataRef = doc(db, 'users', user.uid, 'data', '_metadata');
    const clientsCol = collection(db, 'users', user.uid, 'clients');
    const newClientRef = doc(clientsCol); // Create a reference for the new client

    try {
        const newClientData = await runTransaction(db, async (transaction) => {
            const metadataDoc = await transaction.get(metadataRef);
            
            let currentCounter = 0;
            if (metadataDoc.exists()) {
                currentCounter = metadataDoc.data().clientCounter || 0;
            }
            
            const newCounter = currentCounter + 1;
            const displayId = String(newCounter).padStart(4, '0');

            const clientData: ClientWrite = {
                displayId,
                name,
                phone,
                visits: [],
                createdAt: new Date().toISOString(),
            };

            transaction.set(newClientRef, clientData);
            
            // Update the counter in the metadata document
            transaction.set(metadataRef, { clientCounter: newCounter }, { merge: true });

            return clientData;
        });

        return deserializeClient(newClientRef.id, newClientData);

    } catch (error) {
        console.error("Transaction failed: ", error);
        throw new Error("Failed to add new client. Please try again.");
    }
}


export async function updateClient(id: string, clientData: Partial<Omit<Client, 'id' | 'visits' | 'displayId'>>): Promise<Client> {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const clientRef = doc(db, 'users', user.uid, 'clients', id);
    await updateDoc(clientRef, clientData);

    const updatedClient = await getClient(id);
    if (!updatedClient) throw new Error("Could not find updated client");

    return updatedClient;
}


export async function addVisit(clientId: string, visitData: Omit<Visit, 'id'>): Promise<Client> {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const client = await getClient(clientId);
    if (!client) throw new Error("Client not found");

    const newVisit: Visit = {
        ...visitData,
        id: `v${clientId}-${Date.now()}`
    }

    const updatedVisits: VisitWrite[] = [
        ...(client.visits.map(v => ({...v, date: new Date(v.date).toISOString(), nextVisit: v.nextVisit ? new Date(v.nextVisit).toISOString() : null }))),
        {...newVisit, date: newVisit.date.toISOString(), nextVisit: newVisit.nextVisit ? newVisit.nextVisit.toISOString() : null }
    ]

    const clientRef = doc(db, 'users', user.uid, 'clients', clientId);
    await updateDoc(clientRef, { visits: updatedVisits });

    return (await getClient(clientId))!;
}


export async function updateVisitPaymentStatus(clientId: string, visitId: string, paid: boolean): Promise<Visit> {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    
    const client = await getClient(clientId);
    if (!client) throw new Error("Client not found");

    const visitIndex = client.visits.findIndex(v => v.id === visitId);
    if (visitIndex === -1) {
         throw new Error("Visit not found.");
    }

    client.visits[visitIndex].paid = paid;
    
    const updatedVisits: VisitWrite[] = client.visits.map(v => ({...v, date: new Date(v.date).toISOString(), nextVisit: v.nextVisit ? new Date(v.nextVisit).toISOString() : null }))

    const clientRef = doc(db, 'users', user.uid, 'clients', clientId);
    await updateDoc(clientRef, { visits: updatedVisits });

    return client.visits[visitIndex];
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const clientRef = doc(db, 'users', user.uid, 'clients', id);
    await deleteDoc(clientRef);
    return { success: true };
}

export async function deleteVisit(clientId: string, visitId: string): Promise<{ success: boolean }> {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const client = await getClient(clientId);
    if (!client) throw new Error("Client not found.");

    const updatedVisits = client.visits
        .filter(v => v.id !== visitId)
        .map(v => ({...v, date: new Date(v.date).toISOString(), nextVisit: v.nextVisit ? new Date(v.nextVisit).toISOString() : null }));

    const clientRef = doc(db, 'users', user.uid, 'clients', clientId);
    await updateDoc(clientRef, { visits: updatedVisits });
    
    return { success: true };
}

// Function to add a new premium request
// This is a public operation and does not require authentication
export async function addPremiumRequest(requestData: Omit<PremiumRequestWrite, 'createdAt' | 'status'>): Promise<PremiumRequest> {
    try {
        const requestsCol = collection(db, 'premium_requests');
        const newRequestRef = doc(requestsCol); // Auto-generate ID

        const dataToSave: PremiumRequestWrite = {
            ...requestData,
            createdAt: serverTimestamp(), // Use server timestamp for accuracy
            status: 'pending' // Default status
        };

        await setDoc(newRequestRef, dataToSave);
        return {
            ...dataToSave,
            id: newRequestRef.id,
            createdAt: new Date() // Return a client-side date approximation
        }
    } catch (error) {
        console.error("Error adding premium request:", error);
        throw new Error("Could not save your details. Please try again.");
    }
}
