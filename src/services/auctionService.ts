import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AuctionItem, Bid, AuctionStatus, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const auctionService = {
  async createAuction(data: Omit<AuctionItem, 'id' | 'createdAt' | 'currentBid' | 'status'>) {
    const path = 'auctions';
    try {
      return await addDoc(collection(db, path), {
        ...data,
        currentBid: 0,
        status: AuctionStatus.ACTIVE,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async placeBid(auctionId: string, amount: number, userName: string) {
    const auctionRef = doc(db, 'auctions', auctionId);
    const bidsRef = collection(db, 'auctions', auctionId, 'bids');
    const userId = auth.currentUser?.uid;

    if (!userId) throw new Error("Auth required");

    try {
      await runTransaction(db, async (transaction) => {
        const auctionDoc = await transaction.get(auctionRef);
        if (!auctionDoc.exists()) throw new Error("Auction not found");
        
        const auctionData = auctionDoc.data() as AuctionItem;
        
        if (auctionData.status !== AuctionStatus.ACTIVE) throw new Error("Auction ended");
        if (auctionData.endTime.toMillis() < Date.now()) throw new Error("Auction deadline passed");
        
        const minBid = auctionData.currentBid > 0 ? auctionData.currentBid : auctionData.startingPrice;
        if (amount <= minBid) throw new Error(`Bid must be higher than ${minBid}`);

        // Update auction
        transaction.update(auctionRef, {
          currentBid: amount,
          highestBidderId: userId,
          highestBidderName: userName
        });

        // Add bid record
        const newBidRef = doc(bidsRef);
        transaction.set(newBidRef, {
          auctionId,
          userId,
          userName,
          amount,
          createdAt: serverTimestamp()
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `auctions/${auctionId}/bids`);
    }
  },

  getAuctions(callback: (auctions: AuctionItem[]) => void) {
    const q = query(collection(db, 'auctions'), orderBy('endTime', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const auctions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuctionItem[];
      callback(auctions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'auctions');
    });
  },

  getAuction(id: string, callback: (auction: AuctionItem | null) => void) {
    const auctionRef = doc(db, 'auctions', id);
    return onSnapshot(auctionRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as AuctionItem);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `auctions/${id}`);
    });
  },

  getBids(auctionId: string, callback: (bids: Bid[]) => void) {
    const bidsRef = collection(db, 'auctions', auctionId, 'bids');
    const q = query(bidsRef, orderBy('amount', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const bids = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bid[];
      callback(bids);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `auctions/${auctionId}/bids`);
    });
  },

  async endAuction(id: string) {
    const auctionRef = doc(db, 'auctions', id);
    try {
      await updateDoc(auctionRef, { status: AuctionStatus.ENDED });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `auctions/${id}`);
    }
  }
};
