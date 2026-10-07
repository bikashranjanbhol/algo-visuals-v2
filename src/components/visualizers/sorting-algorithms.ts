// Each algorithm runs to completion up front and records a frame for every
// interesting step, so the visualizer can play, pause and scrub freely.

export type SortAlgorithm = "bubble" | "selection" | "insertion" | "merge" | "quick";

export type SortFrame = {
  array: number[];
  compare: number[];
  write: number[];
  sorted: number[];
  pivot?: number;
  /** Inclusive [lo, hi] range the algorithm is currently working on. */
  range?: [number, number];
  message: string;
  comparisons: number;
  writes: number;
};

type Step = Partial<Pick<SortFrame, "compare" | "write" | "pivot" | "range">> & { message: string };

function createRecorder(input: number[]) {
  const a = [...input];
  const frames: SortFrame[] = [];
  const sorted = new Set<number>();
  const stats = { comparisons: 0, writes: 0 };

  return {
    a,
    sorted,
    stats,
    frames,
    record(step: Step) {
      frames.push({
        array: [...a],
        compare: step.compare ?? [],
        write: step.write ?? [],
        sorted: [...sorted],
        pivot: step.pivot,
        range: step.range,
        message: step.message,
        comparisons: stats.comparisons,
        writes: stats.writes,
      });
    },
    swap(i: number, j: number) {
      [a[i], a[j]] = [a[j], a[i]];
      stats.writes += 2;
    },
    finish() {
      a.forEach((_, i) => sorted.add(i));
      this.record({ message: "Done! The array is sorted." });
      return frames;
    },
  };
}

function bubble(input: number[]) {
  const r = createRecorder(input);
  const { a } = r;
  const n = a.length;
  r.record({ message: "Bubble sort repeatedly swaps adjacent items that are out of order." });
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      r.stats.comparisons++;
      r.record({ compare: [j, j + 1], message: `Compare ${a[j]} and ${a[j + 1]}.` });
      if (a[j] > a[j + 1]) {
        r.swap(j, j + 1);
        swapped = true;
        r.record({ write: [j, j + 1], message: `${a[j + 1]} > ${a[j]}, so swap them.` });
      }
    }
    r.sorted.add(n - i - 1);
    r.record({ message: `Pass ${i + 1} done: ${a[n - i - 1]} has bubbled up to its final position.` });
    if (!swapped) {
      r.record({ message: "No swaps in this pass, so the array is already sorted. Stop early." });
      break;
    }
  }
  return r.finish();
}

function selection(input: number[]) {
  const r = createRecorder(input);
  const { a } = r;
  const n = a.length;
  r.record({ message: "Selection sort finds the smallest remaining item and moves it to the front." });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.record({ pivot: min, range: [i, n - 1], message: `Scan indices ${i}–${n - 1} for the minimum. Start with ${a[i]}.` });
    for (let j = i + 1; j < n; j++) {
      r.stats.comparisons++;
      r.record({ compare: [j], pivot: min, range: [i, n - 1], message: `Is ${a[j]} smaller than the current minimum ${a[min]}?` });
      if (a[j] < a[min]) {
        min = j;
        r.record({ pivot: min, range: [i, n - 1], message: `Yes, ${a[min]} is the new minimum.` });
      }
    }
    if (min !== i) {
      r.swap(i, min);
      r.record({ write: [i, min], message: `Swap the minimum ${a[i]} into index ${i}.` });
    }
    r.sorted.add(i);
    r.record({ message: `${a[i]} is now in its final position.` });
  }
  return r.finish();
}

function insertion(input: number[]) {
  const r = createRecorder(input);
  const { a } = r;
  const n = a.length;
  r.record({ range: [0, 0], message: "Insertion sort grows a sorted prefix, inserting one item at a time." });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    r.record({ pivot: i, range: [0, i - 1], message: `Take ${key} and insert it into the sorted part on the left.` });
    let j = i - 1;
    while (j >= 0) {
      r.stats.comparisons++;
      r.record({ compare: [j], pivot: j + 1, range: [0, i], message: `Compare ${a[j]} with ${key}.` });
      if (a[j] <= key) break;
      a[j + 1] = a[j];
      a[j] = key;
      r.stats.writes++;
      r.record({ write: [j + 1], pivot: j, range: [0, i], message: `${a[j + 1]} > ${key}, so shift ${a[j + 1]} one place right.` });
      j--;
    }
    r.record({ pivot: j + 1, range: [0, i], message: `${key} is in place. The first ${i + 1} items are sorted.` });
  }
  return r.finish();
}

function merge(input: number[]) {
  const r = createRecorder(input);
  const { a } = r;
  r.record({ message: "Merge sort splits the array in half, sorts each half, then merges them." });

  const sortRange = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sortRange(lo, mid);
    sortRange(mid + 1, hi);

    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    r.record({
      range: [lo, hi],
      message: `Merge [${left.join(", ")}] with [${right.join(", ")}].`,
    });
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      r.stats.comparisons++;
      const takeLeft = left[i] <= right[j];
      const value = takeLeft ? left[i++] : right[j++];
      a[k] = value;
      r.stats.writes++;
      r.record({
        write: [k],
        range: [lo, hi],
        message: `${value} is the smaller front item (${takeLeft ? "left" : "right"} half), so write it to index ${k}.`,
      });
      k++;
    }
    while (i < left.length || j < right.length) {
      const fromLeft = i < left.length;
      const value = fromLeft ? left[i++] : right[j++];
      a[k] = value;
      r.stats.writes++;
      r.record({ write: [k], range: [lo, hi], message: `Copy the leftover ${value} to index ${k}.` });
      k++;
    }
    if (lo === 0 && hi === a.length - 1) a.forEach((_, idx) => r.sorted.add(idx));
  };

  sortRange(0, a.length - 1);
  return r.finish();
}

function quick(input: number[]) {
  const r = createRecorder(input);
  const { a } = r;
  r.record({ message: "Quick sort picks a pivot and partitions smaller items to its left, larger to its right." });

  const sortRange = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.sorted.add(lo);
      r.record({ range: [lo, hi], message: `A single item (${a[lo]}) is already sorted.` });
      return;
    }
    const pivot = a[hi];
    r.record({ pivot: hi, range: [lo, hi], message: `Choose the last item, ${pivot}, as the pivot.` });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      r.stats.comparisons++;
      r.record({ compare: [j], pivot: hi, range: [lo, hi], message: `Is ${a[j]} smaller than the pivot ${pivot}?` });
      if (a[j] < pivot) {
        if (i !== j) {
          r.swap(i, j);
          r.record({ write: [i, j], pivot: hi, range: [lo, hi], message: `Yes. Swap ${a[i]} into the "smaller" side at index ${i}.` });
        } else {
          r.record({ pivot: hi, range: [lo, hi], message: `Yes. ${a[i]} is already on the "smaller" side.` });
        }
        i++;
      }
    }
    if (i !== hi) r.swap(i, hi);
    r.sorted.add(i);
    r.record({ write: [i], range: [lo, hi], message: `Place the pivot ${pivot} at index ${i}. That is its final position.` });
    sortRange(lo, i - 1);
    sortRange(i + 1, hi);
  };

  sortRange(0, a.length - 1);
  return r.finish();
}

export const sortingAlgorithms: Record<
  SortAlgorithm,
  { name: string; run: (input: number[]) => SortFrame[]; time: string; space: string; stable: boolean }
> = {
  bubble: { name: "Bubble sort", run: bubble, time: "O(n²)", space: "O(1)", stable: true },
  selection: { name: "Selection sort", run: selection, time: "O(n²)", space: "O(1)", stable: false },
  insertion: { name: "Insertion sort", run: insertion, time: "O(n²)", space: "O(1)", stable: true },
  merge: { name: "Merge sort", run: merge, time: "O(n log n)", space: "O(n)", stable: true },
  quick: { name: "Quick sort", run: quick, time: "O(n log n) avg", space: "O(log n)", stable: false },
};

/** Small deterministic PRNG so the server and client render the same first array. */
export function seededArray(size: number, seed = 7) {
  let s = seed;
  const next = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: size }, () => 5 + Math.floor(next() * 95));
}
