"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Gift, Plus, Trash2, Wallet } from "lucide-react";
import {
  api,
  getActiveWeddingId,
  mediaUrl,
  type CashContribution,
  type CashFund,
  type GiftItem,
  type HostRegistry,
} from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/ui/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GiftsPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [registry, setRegistry] = useState<HostRegistry | null>(null);
  const [loading, setLoading] = useState(true);

  const [giftTitle, setGiftTitle] = useState("");
  const [giftDesc, setGiftDesc] = useState("");
  const [giftPrice, setGiftPrice] = useState("");
  const [giftQty, setGiftQty] = useState("1");
  const [giftImage, setGiftImage] = useState("");
  const [giftStore, setGiftStore] = useState("");

  const [fundTitle, setFundTitle] = useState("");
  const [fundDesc, setFundDesc] = useState("");
  const [fundGoal, setFundGoal] = useState("");
  const [fundImage, setFundImage] = useState("");

  const load = useCallback(async (id: number) => {
    setRegistry(await api.getHostRegistry(id));
  }, []);

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    load(id)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [load]);

  async function addGift(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !giftTitle.trim()) return;
    try {
      await api.createGiftItem(weddingId, {
        title: giftTitle.trim(),
        description: giftDesc.trim() || undefined,
        priceAmount: giftPrice ? Number(giftPrice) : undefined,
        quantityDesired: Math.max(1, Number(giftQty) || 1),
        imageUrl: giftImage || undefined,
        storeUrl: giftStore.trim() || undefined,
        publicVisible: true,
      });
      setGiftTitle("");
      setGiftDesc("");
      setGiftPrice("");
      setGiftQty("1");
      setGiftImage("");
      setGiftStore("");
      await load(weddingId);
      toast.success("Gift added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add gift");
    }
  }

  async function addFund(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !fundTitle.trim() || !fundGoal) return;
    try {
      await api.createCashFund(weddingId, {
        title: fundTitle.trim(),
        description: fundDesc.trim() || undefined,
        goalAmount: Number(fundGoal),
        imageUrl: fundImage || undefined,
        publicVisible: true,
      });
      setFundTitle("");
      setFundDesc("");
      setFundGoal("");
      setFundImage("");
      await load(weddingId);
      toast.success("Cash fund added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add fund");
    }
  }

  async function toggleGift(gift: GiftItem) {
    if (!weddingId) return;
    try {
      await api.updateGiftItem(weddingId, gift.id, {
        title: gift.title,
        description: gift.description ?? undefined,
        imageUrl: gift.imageUrl ?? undefined,
        storeUrl: gift.storeUrl ?? undefined,
        priceAmount: gift.priceAmount ?? undefined,
        currency: gift.currency,
        quantityDesired: gift.quantityDesired,
        publicVisible: !gift.publicVisible,
        sortOrder: gift.sortOrder,
      });
      await load(weddingId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function toggleFund(fund: CashFund) {
    if (!weddingId) return;
    try {
      await api.updateCashFund(weddingId, fund.id, {
        title: fund.title,
        description: fund.description ?? undefined,
        goalAmount: fund.goalAmount,
        currency: fund.currency,
        imageUrl: fund.imageUrl ?? undefined,
        publicVisible: !fund.publicVisible,
        sortOrder: fund.sortOrder,
      });
      await load(weddingId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function removeGift(id: number) {
    if (!weddingId || !confirm("Delete this gift item?")) return;
    try {
      await api.deleteGiftItem(weddingId, id);
      await load(weddingId);
      toast.success("Gift deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function removeFund(id: number) {
    if (!weddingId || !confirm("Delete this cash fund and its contributions?")) return;
    try {
      await api.deleteCashFund(weddingId, id);
      await load(weddingId);
      toast.success("Fund deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function setContributionStatus(
    contribution: CashContribution,
    status: CashContribution["status"]
  ) {
    if (!weddingId) return;
    try {
      await api.updateContributionStatus(weddingId, contribution.id, status);
      await load(weddingId);
      toast.success(`Marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading registry…</p>;

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Gifts</h1>
        <p className="text-muted-foreground">Select an active wedding first.</p>
        <Button asChild>
          <Link href="/weddings">Go to weddings</Link>
        </Button>
      </div>
    );
  }

  const gifts = registry?.gifts ?? [];
  const funds = registry?.cashFunds ?? [];
  const contributions = registry?.contributions ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Gift registry</h1>
        <p className="mt-1 text-muted-foreground">
          Gift items and cash funds for your public page. PayHere checkout comes later — guests can
          claim and pledge now; confirm pledges below.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Gift className="h-5 w-5" />
              Add gift
            </CardTitle>
            <CardDescription>Guests can claim remaining quantity on the public site.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addGift} className="space-y-3">
              <Input
                value={giftTitle}
                onChange={(e) => setGiftTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <Input
                value={giftDesc}
                onChange={(e) => setGiftDesc(e.target.value)}
                placeholder="Description"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  value={giftPrice}
                  onChange={(e) => setGiftPrice(e.target.value)}
                  placeholder="Price (LKR)"
                />
                <Input
                  type="number"
                  min={1}
                  value={giftQty}
                  onChange={(e) => setGiftQty(e.target.value)}
                  placeholder="Qty"
                />
              </div>
              <Input
                value={giftStore}
                onChange={(e) => setGiftStore(e.target.value)}
                placeholder="Store / product link (optional)"
              />
              <ImageUploadField
                weddingId={weddingId}
                value={giftImage}
                onChange={setGiftImage}
                label="Image"
              />
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Add gift
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-5 w-5" />
              Add cash fund
            </CardTitle>
            <CardDescription>Honeymoon / house fund style goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addFund} className="space-y-3">
              <Input
                value={fundTitle}
                onChange={(e) => setFundTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <Input
                value={fundDesc}
                onChange={(e) => setFundDesc(e.target.value)}
                placeholder="Description"
              />
              <Input
                type="number"
                min={1}
                value={fundGoal}
                onChange={(e) => setFundGoal(e.target.value)}
                placeholder="Goal amount (LKR)"
                required
              />
              <ImageUploadField
                weddingId={weddingId}
                value={fundImage}
                onChange={setFundImage}
                label="Image"
              />
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Add fund
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Gifts ({gifts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              {gift.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(gift.imageUrl)}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Gift className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{gift.title}</p>
                  <Badge variant={gift.publicVisible ? "secondary" : "outline"}>
                    {gift.publicVisible ? "Public" : "Hidden"}
                  </Badge>
                  <Badge variant={gift.fullyClaimed ? "outline" : "secondary"}>
                    {gift.quantityClaimed}/{gift.quantityDesired} claimed
                  </Badge>
                </div>
                {gift.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{gift.description}</p>
                )}
                {gift.priceAmount != null && (
                  <p className="mt-1 text-sm">
                    {gift.currency} {Number(gift.priceAmount).toLocaleString()}
                  </p>
                )}
                {gift.claims.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {gift.claims.map((c) => (
                      <li key={c.id}>
                        Claimed by {c.claimerName}
                        {c.claimerEmail ? ` (${c.claimerEmail})` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleGift(gift)}>
                  {gift.publicVisible ? "Hide" : "Publish"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeGift(gift.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {!gifts.length && (
            <p className="text-sm text-muted-foreground">No gifts yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Cash funds ({funds.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {funds.map((fund) => (
            <div
              key={fund.id}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              {fund.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(fund.imageUrl)}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{fund.title}</p>
                  <Badge variant={fund.publicVisible ? "secondary" : "outline"}>
                    {fund.publicVisible ? "Public" : "Hidden"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm">
                  Raised {fund.currency} {Number(fund.raisedAmount).toLocaleString()} /{" "}
                  {Number(fund.goalAmount).toLocaleString()} ({fund.progressPercent}%)
                  {Number(fund.pendingAmount) > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      · pending {Number(fund.pendingAmount).toLocaleString()}
                    </span>
                  )}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, fund.progressPercent)}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleFund(fund)}>
                  {fund.publicVisible ? "Hide" : "Publish"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeFund(fund.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {!funds.length && (
            <p className="text-sm text-muted-foreground">No cash funds yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contributions</CardTitle>
          <CardDescription>
            Confirm pledges to count them toward the raised total (until PayHere is connected).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {contributions.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {c.contributorName} → {c.fundTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Number(c.amount).toLocaleString()} · {c.status}
                  {c.message ? ` · ${c.message}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {c.status !== "CONFIRMED" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setContributionStatus(c, "CONFIRMED")}
                  >
                    Confirm
                  </Button>
                )}
                {c.status !== "CANCELLED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setContributionStatus(c, "CANCELLED")}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!contributions.length && (
            <p className="text-sm text-muted-foreground">No contributions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
