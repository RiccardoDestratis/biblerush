# Supabase Realtime Cost Analysis

## Pro Plan Limits (Included)

✅ **5 million Realtime messages/month** (free)
✅ **500 peak concurrent connections** (free)
✅ **250 GB egress/month** (free)

## Overage Costs

- 💰 **$2.50 per million messages** over 5M
- 💰 **$10 per 1,000 peak connections** over 500
- 💰 **$0.09 per GB egress** over 250 GB

## Important: How Messages Are Counted

**Each Realtime message = 1 message per client that receives it**

Example:
- Server broadcasts `scores_updated` event
- 10 clients (host + 9 players) are subscribed
- **Result: 10 messages counted** (not 1!)

---

## Our Usage Pattern Analysis

### Current Pattern

**1. Client-Side Channels (Persistent)**
- ✅ Created once when game starts
- ✅ Stay subscribed for entire game
- ✅ Counted as 1 connection per client (not per message)

**2. Server-Side Channels (Temporary)**
- ⚠️ Created temporarily for each broadcast
- ⚠️ Subscribe → Broadcast → Unsubscribe
- ⚠️ **This doesn't count as messages** (only broadcasts do)
- ⚠️ **Each connection is temporary** (~500ms duration)

### Cost Impact of Temporary Server Channels

**Good News:** ⚠️ **Temporary server channels don't increase message count**
- Subscribe/unsubscribe actions are **not counted as messages**
- Only the actual **broadcasts** count as messages
- Temporary channels are just a technical requirement for broadcasting

**Connection Impact:**
- Temporary connections last ~500ms
- Peak connections would only spike if many broadcasts happen simultaneously
- For a quiz game, this is negligible (1-2 broadcasts per question)

---

## Estimated Usage for BibleRush Quiz Game

### Scenario: Active Game Session

**Per Game:**
- 10 players + 1 host = 11 concurrent connections
- 10 questions per game
- ~2 broadcasts per question (scores_updated, answer_reveal)
- Total: 20 broadcasts per game
- Messages: 20 broadcasts × 11 clients = **220 messages per game**

**Per Month (Assuming 100 active games):**
- Connections: 11 per game (peak = 500 included limit covers 45+ concurrent games)
- Messages: 100 games × 220 messages = **22,000 messages**
- Well under 5M monthly limit ✅

**Per Month (Assuming 1,000 active games):**
- Messages: 1,000 games × 220 messages = **220,000 messages**
- Still well under 5M monthly limit ✅

**Per Month (Extreme case - 10,000 active games):**
- Messages: 10,000 games × 220 messages = **2,200,000 messages**
- Still under 5M monthly limit ✅

**To reach 5M message limit:**
- Need ~22,727 games per month (760 games/day)
- Or ~2,272 games/day (very high activity)

---

## Cost Optimization Insights

### What Matters for Billing

1. ✅ **Number of broadcasted messages** (what we're doing)
2. ✅ **Number of clients receiving each broadcast** (each counts as 1 message)
3. ✅ **Peak concurrent connections** (our client channels)

### What Doesn't Matter

1. ❌ **Temporary server channel subscriptions** (not counted separately)
2. ❌ **Subscribe/unsubscribe operations** (not counted as messages)
3. ❌ **Channel creation/destruction** (just connection overhead, minimal)

### Optimization Opportunities

**Current Implementation is Already Optimized:**
- ✅ Client channels stay subscribed (efficient connection usage)
- ✅ Only broadcast when necessary (scores_updated, answer_reveal)
- ✅ Minimal payload sizes (small JSON objects)

**Potential Optimizations (if needed):**
1. **Batch broadcasts** - Combine multiple events into single broadcast
   - Trade-off: Slightly more complex client handling
   - Benefit: Fewer messages sent
   
2. **Reduce client count** - Only subscribe clients that need updates
   - Already doing this (only active game participants)
   
3. **Compress payloads** - Minimize JSON payload size
   - Already optimized (small payloads)

---

## Connection Limits Analysis

**Peak Connections:**
- Each active game participant = 1 connection
- 10 players + 1 host = 11 connections per game
- **Pro plan limit: 500 peak connections**
- **Can handle ~45 concurrent games simultaneously**

**Temporary Server Connections:**
- Last ~500ms each
- Peak impact: Negligible (spike for <1 second during broadcast)
- **Won't significantly impact peak connection count**

---

## Real-World Usage Estimates

### Conservative Estimate (Small-Scale)
- 50 active games/month
- 11,000 messages/month (50 × 220)
- **Cost: $0** ✅
- Usage: 0.22% of message quota

### Moderate Estimate (Growing)
- 500 active games/month
- 110,000 messages/month (500 × 220)
- **Cost: $0** ✅
- Usage: 2.2% of message quota

### High-Traffic Estimate
- 5,000 active games/month
- 1,100,000 messages/month (5,000 × 220)
- **Cost: $0** ✅
- Usage: 22% of message quota

### Extreme Case (Breaking Limits)
- 25,000 active games/month
- 5,500,000 messages/month
- **Overage: 500,000 messages**
- **Additional Cost: $1.25** ✅
- Still very affordable!

---

## Recommendations

### For Current Usage Pattern

✅ **No changes needed** - Current implementation is cost-efficient:
- Temporary server channels don't add message costs
- Client channels are already optimized (persistent, not recreated)
- Message count is minimal compared to Pro plan limits

### Monitoring

1. **Enable Spend Cap** (available on Pro plan)
   - Prevents unexpected charges
   - Auto-stops over-limit usage
   - Can adjust monthly

2. **Monitor Dashboard**
   - Check usage in Supabase dashboard
   - Track message trends
   - Watch for unusual spikes

3. **Set Up Alerts** (if available)
   - Get notified at 80% of quota
   - Adjust usage patterns if needed

---

## Conclusion

**Current Implementation is Cost-Efficient:**

1. ✅ **Temporary server channels don't increase costs**
   - Only broadcasts count as messages
   - Subscribe/unsubscribe operations are free
   - Connection overhead is negligible

2. ✅ **Client channels are already optimized**
   - Persistent connections (efficient)
   - Only active participants subscribe

3. ✅ **Message usage is minimal**
   - ~220 messages per game
   - Pro plan includes 5M messages/month
   - Can handle 22,000+ games before hitting limits

4. ✅ **Connection limits are generous**
   - 500 peak connections included
   - Can handle 45+ concurrent games
   - Temporary server connections don't impact peak

**Bottom Line:** Your current pattern is already optimal for cost. The temporary server channels are a necessary technical requirement and don't significantly impact billing.

---

## Future Scaling Considerations

If you reach high traffic (>20,000 games/month):

1. **Consider message batching** (combine multiple events)
2. **Review payload sizes** (already small)
3. **Optimize connection management** (already optimized)

But for typical usage, you're well within Pro plan limits with plenty of headroom.

