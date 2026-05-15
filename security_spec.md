# Security Specification for AuctionLive

## Data Invariants
1. **Identity Integrity**: Users can only write their own profile to `/users/{userId}`.
2. **Auction Creation**: Only authenticated users (admins) can create auctions.
3. **Bidding Deadline**: Bids are only allowed if `request.time < auction.endTime`.
4. **Bid Increments**: A new bid must be strictly greater than the auction's `currentBid` AND the `startingPrice`.
5. **Bid Immutability**: Bids cannot be updated or deleted once created.
6. **Atomicity**: When a bid is created, the parent auction item's `currentBid` and `highestBidderId` must be updated in the same transaction (verified via `existsAfter` or similar if needed, though client-side follows this pattern).

## The Dirty Dozen Payloads (Rejection Targets)
1. **Spoofing**: Placing a bid with `userId = "someone_else"`.
2. **Self-Promotion**: Non-admin creating an auction.
3. **Time Travel**: Placing a bid after `endTime`.
4. **Under-bidding**: Placing a bid lower than `currentBid`.
5. **Ghost Fields**: Adding `isAdmin: true` to a user profile update.
6. **Auction Manipulation**: A non-owner/non-admin attempting to change `endTime`.
7. **Junk IDs**: Using a 1MB string as a `projectId`.
8. **PII Leak**: Non-admin reading someone else's email.
9. **Negative Money**: Placing a bid with `amount = -100`.
10. **State Skipping**: Manually setting `status = "ended"` before `endTime`.
11. **Shadow Update**: Updating a bid to change its `amount`.
12. **Unauthorized Deletion**: A user trying to delete an auction created by someone else.

## Firestore Rules (Draft v1)
See `firestore.rules`.
