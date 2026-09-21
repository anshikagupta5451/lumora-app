import { create } from "zustand";
import { FaceScanResult } from "../api/faceScan";

// Hands a freshly-analyzed scan from face-scan.tsx to
// face-scan-results.tsx without a route param carrying the whole
// payload, mirroring useScanStore's handoff for barcode scans.
interface FaceScanState {
  latestScan: FaceScanResult | null;
  setLatestScan: (scan: FaceScanResult | null) => void;
}

export const useFaceScanStore = create<FaceScanState>((set) => ({
  latestScan: null,
  setLatestScan: (scan) => set({ latestScan: scan }),
}));
