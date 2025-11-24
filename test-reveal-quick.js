// Quick test script - just check if broadcast works
// Run in browser console on player page

// Monitor for answer_reveal events
window.testRevealListener = () => {
  console.error('🔥 TEST: Listening for answer_reveal events...');
  
  // Get the channel from the component (if accessible)
  // Or create a test channel
  const supabase = window.supabase || {};
  
  console.error('🔥 Check if channel exists in window');
  console.error('🔥 Check browser console for "[Player X] 📨 Received answer_reveal event"');
  console.error('🔥 Check browser console for "[Realtime] 🔥 answer_reveal broadcast received"');
};

testRevealListener();


