/**
 * Performance Test Script for State Management Core
 * Uses stand-alone execution to verify performance requirements.
 */
import { createBaseStore } from '../src/state/BaseStore';
import { StateObserver } from '../src/state/StateObserver';

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...\n');

  // T037: 1000 state updates with StateObserver
  console.log('🔹 T037: Testing Observer Throughput (1000 updates)');

  const observer = StateObserver.getInstance();
  const perfStore = createBaseStore<{ count: number; inc: () => void }>(
    {
      name: 'perf-store',
      initialState: { count: 0, inc: () => {} },
      devtools: false,
    },
    (set) =>
      ({
        inc: () =>
          set((state: any) => {
            state.count += 1;
          }),
      }) as any
  );

  let updateCount = 0;
  const unsubscribe = observer.subscribe(perfStore, () => {
    updateCount++;
  });

  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    perfStore.getState().inc();
  }
  const end = performance.now();
  const duration = end - start;
  const avg = duration / 1000;

  console.log(`   Total Time: ${duration.toFixed(2)}ms`);
  console.log(`   Avg per update: ${avg.toFixed(4)}ms`);
  console.log(`   Target: < 10ms per update`);

  if (avg < 10) {
    console.log('   ✅ PASS: Throughput requirement met');
  } else {
    console.error('   ❌ FAIL: Too slow');
  }
  unsubscribe();
  console.log('');

  // T038: Store with 10,000 items (Memory/Responsiveness)
  console.log('🔹 T038: Large Dataset Test (10,000 items)');

  interface LargeItem {
    id: string;
    val: number;
    payload: string;
  }
  interface LargeState {
    items: LargeItem[];
    addBatch: (items: LargeItem[]) => void;
  }

  const largeStore = createBaseStore<LargeState>(
    {
      name: 'large-store',
      initialState: { items: [], addBatch: () => {} },
      devtools: false,
    },
    (set) =>
      ({
        addBatch: (newItems: LargeItem[]) =>
          set((state: any) => {
            state.items.push(...newItems);
          }),
      }) as any
  );

  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: `item-${i}`,
    val: i,
    payload: 'x'.repeat(100),
  }));

  const startLarge = performance.now();
  largeStore.getState().addBatch(items);
  const endLarge = performance.now();

  console.log(`   Batch add 10k items: ${(endLarge - startLarge).toFixed(2)}ms`);

  const state = largeStore.getState();
  if (state.items.length === 10000) {
    console.log('   ✅ PASS: 10,000 items handled successfully');
  } else {
    console.log('   ❌ FAIL: Item count mismatch');
  }
}

runPerformanceTests().catch(console.error);
