/**
 * MinHeap.js
 * ---------------------------------------------------------------------------
 * A hand-written binary min-heap used as the priority queue for Dijkstra's
 * and Prim's algorithms.
 *
 * We implement this manually (instead of pulling in an npm priority-queue
 * package) because the whole point of the DAA project is to demonstrate the
 * actual data structure that gives these greedy algorithms their textbook
 * time complexity of O((V + E) log V).
 *
 * Each entry is { key, priority }. Smaller priority = higher priority.
 *
 * Supported operations (all O(log n) except peek/size which are O(1)):
 *   push(key, priority)
 *   pop()              -> { key, priority } with smallest priority
 *   decreaseKey(key, newPriority) -> lazily supported via re-push + stale check
 *   isEmpty()
 *   size()
 */

class MinHeap {
  constructor() {
    // heap[i] = { key, priority }
    this.heap = [];
    // Track the best-known index of a key isn't cheap in an array heap,
    // so we use the standard "lazy deletion" trick: allow duplicate pushes
    // for a key and simply skip stale (already-finalized) entries on pop.
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap[0] || null;
  }

  push(key, priority) {
    this.heap.push({ key, priority });
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority <= this.heap[index].priority) break;
      this._swap(parent, index);
      index = parent;
    }
  }

  _bubbleDown(index) {
    const n = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < n && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      this._swap(index, smallest);
      index = smallest;
    }
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

module.exports = MinHeap;
