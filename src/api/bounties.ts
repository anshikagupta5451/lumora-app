import { apiFetch } from "./client";

export interface Bounty {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  completed: boolean;
}

export interface BountiesResponse {
  bounties: Bounty[];
  totalPoints: number;
}

export function getBounties() {
  return apiFetch<BountiesResponse>("/bounties");
}

export function completeBounty(id: string) {
  return apiFetch<{ id: string; userId: string; bountyId: string }>(
    `/bounties/${id}/complete`,
    { method: "POST" },
  );
}
