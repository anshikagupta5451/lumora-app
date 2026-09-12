import { create } from "zustand";
import { Product } from "../api/products";

// Hands a barcode-scan result back to whichever screen pushed the scanner
// on top of itself (Add product / Write a review), without creating a
// duplicate screen instance the way navigating back to it with new params
// would. The pushing screen reads this on focus and clears it once consumed.
interface ScanState {
  scannedProduct: Product | null;
  setScannedProduct: (product: Product | null) => void;
}

export const useScanStore = create<ScanState>((set) => ({
  scannedProduct: null,
  setScannedProduct: (product) => set({ scannedProduct: product }),
}));
