"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaBox,
  FaTimes,
  FaTable,
  FaListAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// Constants
const API_BASE_URL = "http://localhost:7013/api/packer";
const ADMIN_ORDERS_URL = "http://localhost:7013/api/admin/getPackerOrders2";
const PACKING_GROUPED_URL = `${API_BASE_URL}/packing/today/grouped`;
const HUBS_API_URL = "http://localhost:7013/api/Hub/hubs";
const SWR_KEY = "packer:combined";
const LOCAL_CACHE_KEY = "packer:combined:cache:v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getUserRole() {
  if (typeof window === "undefined") return null;

  const isAdmin = localStorage.getItem("admin");
  if (isAdmin === "Admin Login Successfully") {
    return "admin";
  }

  const packerData = localStorage.getItem("packer");
  if (packerData) {
    try {
      const packer = JSON.parse(packerData);
      return "packer";
    } catch {
      return null;
    }
  }

  return null;
}

function getPackerData() {
  if (typeof window === "undefined") return null;

  const packerData = localStorage.getItem("packer");
  if (packerData) {
    try {
      return JSON.parse(packerData);
    } catch {
      return null;
    }
  }

  return null;
}

// Util: read/write local cache with TTL
function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.ts) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {}
  return null;
}
function writeLocalCache(data) {
  try {
    localStorage.setItem(
      LOCAL_CACHE_KEY,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {}
}

// AbortError helper and clearer error messaging
function isAbortError(err) {
  return err?.name === "AbortError" || /aborted/i.test(err?.message || "");
}

// Fetch with timeout + graceful fallback to cache
async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...opts,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Non-JSON for ${url}: ${text.slice(0, 120)}...`);
    }
    const json = await res.json();
    return json;
  } catch (err) {
    if (isAbortError(err)) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

// Add cache-busting helper for grouped endpoint
function withBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}ts=${Date.now()}`;
}

// Combined fetcher for SWR
async function fetchCombined() {
  const cached = readLocalCache();

  // 1) Kick admin transform (persists items for today) with a short timeout
  try {
    await fetchWithTimeout(ADMIN_ORDERS_URL, {}, 5000);
  } catch (e) {
    console.log("[v0] getPackerOrders2 skipped/failed:", e.message);
  }

  // 2) Fetch grouped with cache-bust and a few retries to catch just-written docs
  let groupedJson = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      groupedJson = await fetchWithTimeout(
        withBust(PACKING_GROUPED_URL),
        {},
        6000
      );
      break;
    } catch (e) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.log("[v0] grouped fetch failed:", e.message);
    }
  }

  let groupedData = [];
  if (
    Array.isArray(groupedJson?.data?.groupedData) &&
    groupedJson.data.groupedData.length > 0
  ) {
    groupedData = groupedJson.data.groupedData;
  } else if (
    cached &&
    Array.isArray(cached.groupedData) &&
    cached.groupedData.length > 0
  ) {
    groupedData = cached.groupedData;
  }

  // Instead of throwing, return cached/empty to keep UI responsive; SWR will revalidate again soon
  if (!Array.isArray(groupedData)) groupedData = [];

  const combined = {
    sendToPackingResult: null,
    groupedData,
    __fromCache: !(
      Array.isArray(groupedJson?.data?.groupedData) &&
      groupedJson.data.groupedData.length > 0
    ),
  };

  writeLocalCache(combined);
  return combined;
}

// Custom hook: SWR + fallbackData from localStorage for instant paint
function usePackingData() {
  const fallbackData = typeof window !== "undefined" ? readLocalCache() : null;

  const {
    data,
    error,
    isValidating,
    mutate: swrMutate,
  } = useSWR(SWR_KEY, fetchCombined, {
    fallbackData,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 2000,
    refreshInterval: 0, // we'll run our own interval below
    refreshWhenHidden: true, // keep polling even if tab hidden
    errorRetryCount: 1,
    errorRetryInterval: 3000,
    shouldRetryOnError: (err) => {
      if (isAbortError(err)) return false;
      return true;
    },
  });

  return {
    data,
    error,
    isValidating,
    refresh: () => swrMutate(),
    mutate: swrMutate,
  };
}

function useHubs() {
  const { data, error, isValidating } = useSWR(
    HUBS_API_URL,
    async (url) => {
      try {
        const res = await fetchWithTimeout(url, {}, 8000);
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.log("[v0] hubs fetch failed:", err.message);
        return [];
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // cache for 1 minute
    }
  );

  return {
    hubs: data || [],
    hubsLoading: isValidating,
    hubsError: error,
  };
}

function getPackerHubName(packerHubIds, allHubs) {
  if (!Array.isArray(packerHubIds) || !Array.isArray(allHubs)) return null;
  const matchedHub = allHubs.find((hub) => packerHubIds.includes(hub.hubId));
  return matchedHub ? matchedHub.hubName : null;
}

function getLocationsForHub(hubName, allHubs) {
  if (!hubName || !Array.isArray(allHubs)) return [];
  const hub = allHubs.find((h) => h.hubName === hubName);
  return hub?.locations || [];
}

// Derive filters from dataset (memoized)
function useAvailableFilters(
  groupedData,
  userRole,
  packerData,
  allHubs,
  packerHubName
) {
  return useMemo(() => {
    if (!Array.isArray(groupedData)) {
      return { hubs: [], slots: [], deliveryLocations: [] };
    }
    const hubs = [
      ...new Set(
        groupedData.flatMap((item) =>
          Array.isArray(item.hub) ? item.hub : [item.hub].filter(Boolean)
        )
      ),
    ];
    const slots = [
      ...new Set(groupedData.map((item) => item.slot).filter(Boolean)),
    ];

    let deliveryLocations = [
      ...new Set(
        groupedData.flatMap((item) =>
          Array.isArray(item.orders)
            ? item.orders
                .map((order) => order?.deliveryLocation)
                .filter(Boolean)
                .filter((loc) => loc !== "Unknown Location")
            : []
        )
      ),
    ];

    if (userRole === "packer" && packerHubName) {
      const packerHubLocations = getLocationsForHub(packerHubName, allHubs);
      deliveryLocations = deliveryLocations.filter((loc) =>
        packerHubLocations.some(
          (hLoc) =>
            loc.toLowerCase().includes(hLoc.toLowerCase()) ||
            hLoc.toLowerCase().includes(loc.toLowerCase())
        )
      );
    } else if (userRole === "packer" && packerData?.locations) {
      // Fallback to packer's locations if hub name not found
      const packerLocations = packerData.locations;
      deliveryLocations = deliveryLocations.filter((loc) =>
        packerLocations.some(
          (pLoc) =>
            loc.toLowerCase().includes(pLoc.toLowerCase()) ||
            pLoc.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    return { hubs, slots, deliveryLocations };
  }, [groupedData, userRole, packerData, allHubs, packerHubName]);
}

// Summary calc (memoized)
function useSummary(packingData, filters, packer, userRole, packerHubName) {
  return useMemo(() => {
    if (!Array.isArray(packingData))
      return {
        totalGroups: 0,
        totalOrdered: 0,
        totalPacked: 0,
        remainingItems: 0,
        fullyPackedGroups: 0,
        partiallyPackedGroups: 0,
        notPackedGroups: 0,
      };

    let filtered = packingData;

    if (userRole === "packer" && packerHubName) {
      // Packers only see their assigned hub
      filtered = filtered.filter((item) => {
        const itemHubs = Array.isArray(item.hub)
          ? item.hub
          : [item.hub].filter(Boolean);
        return itemHubs.includes(packerHubName);
      });
    } else if (userRole === "admin") {
      // Admin can see all hubs
      if (filters.hub !== "all") {
        filtered = filtered.filter((item) => {
          const itemHubs = Array.isArray(item.hub)
            ? item.hub
            : [item.hub].filter(Boolean);
          return itemHubs.includes(filters.hub);
        });
      }
    }

    if (filters.slot !== "all") {
      filtered = filtered.filter((item) => item.slot === filters.slot);
    }
    if (filters.deliveryLocation !== "all") {
      const needle = filters.deliveryLocation.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          Array.isArray(item.orders) &&
          item.orders.some(
            (o) =>
              o?.deliveryLocation &&
              o.deliveryLocation.toLowerCase().includes(needle)
          )
      );
    }
    if (filters.deliveryLocations?.length > 0) {
      filtered = filtered.filter(
        (item) =>
          Array.isArray(item.orders) &&
          item.orders.some((o) =>
            filters.deliveryLocations.some(
              (sel) =>
                o?.deliveryLocation &&
                o.deliveryLocation.toLowerCase().includes(sel.toLowerCase())
            )
          )
      );
    }

    const totalOrdered = filtered.reduce(
      (sum, it) => sum + (Number(it.totalOrdered) || 0),
      0
    );
    const totalPacked = filtered.reduce(
      (sum, it) => sum + (Number(it.totalPacked ?? it.packed) || 0),
      0
    );

    return {
      totalGroups: filtered.length,
      totalOrdered,
      totalPacked,
      remainingItems: Math.max(0, totalOrdered - totalPacked),
      fullyPackedGroups: filtered.filter((it) => it.isFullyPacked).length,
      partiallyPackedGroups: filtered.filter(
        (it) => it.isPacked && !it.isFullyPacked
      ).length,
      notPackedGroups: filtered.filter((it) => !it.isPacked).length,
    };
  }, [packingData, filters, packer, userRole, packerHubName]);
}

// Group items for table (memoized)
function useGroupedItems(
  packingData,
  filters,
  packer,
  userRole,
  packerHubName
) {
  return useMemo(() => {
    if (!Array.isArray(packingData)) return [];

    const groupedMap = new Map();

    for (const item of packingData) {
      if (!item || typeof item !== "object") continue;

      const itemHubs = Array.isArray(item.hub)
        ? item.hub
        : [item.hub].filter(Boolean);

      if (userRole === "packer" && packerHubName) {
        if (!itemHubs.includes(packerHubName)) continue;
      } else if (userRole === "admin") {
        if (filters.hub !== "all" && !itemHubs.includes(filters.hub)) continue;
      }

      if (filters.slot !== "all" && item.slot !== filters.slot) continue;

      if (filters.deliveryLocation !== "all") {
        const needle = filters.deliveryLocation.toLowerCase();
        const ok =
          Array.isArray(item.orders) &&
          item.orders.some(
            (o) =>
              o?.deliveryLocation &&
              o.deliveryLocation.toLowerCase().includes(needle)
          );
        if (!ok) continue;
      }
      if (filters.deliveryLocations?.length > 0) {
        const ok =
          Array.isArray(item.orders) &&
          item.orders.some((o) =>
            filters.deliveryLocations.some(
              (sel) =>
                o?.deliveryLocation &&
                o.deliveryLocation.toLowerCase().includes(sel.toLowerCase())
            )
          );
        if (!ok) continue;
      }

      const key = `${item.name}-${itemHubs[0]}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          name: item.name || "Unknown Item",
          category: item.category || "Unknown Category",
          categoryName: item.categoryName || "Unknown Category Name",
          unit: item.unit || "unit",
          hub: itemHubs,
          totalOrdered: 0,
          totalPacked: 0,
          slots: new Map(),
          isPacked: false,
          isFullyPacked: false,
          deliveryLocations: new Set(),
        });
      }
      const group = groupedMap.get(key);
      const itemOrdered = Number(item.totalOrdered) || 0;
      const itemPacked = Number(item.totalPacked ?? item.packed) || 0;

      group.totalOrdered += itemOrdered;
      group.totalPacked += itemPacked;

      const slotName = item.slot || "Unknown Slot";
      if (!group.slots.has(slotName)) {
        group.slots.set(slotName, {
          slot: slotName,
          ordered: itemOrdered,
          packed: itemPacked,
          remaining: Math.max(0, itemOrdered - itemPacked),
          isFullyPacked: !!item.isFullyPacked,
          isPacked: !!item.isPacked,
        });
      } else {
        const s = group.slots.get(slotName);
        s.ordered += itemOrdered;
        s.packed += itemPacked;
        s.remaining = Math.max(0, s.ordered - s.packed);
        s.isPacked = s.packed > 0;
        s.isFullyPacked = s.packed === s.ordered;
      }

      if (Array.isArray(item.orders)) {
        for (const o of item.orders) {
          if (
            o?.deliveryLocation &&
            o.deliveryLocation !== "Unknown Location"
          ) {
            group.deliveryLocations.add(o.deliveryLocation);
          }
        }
      }

      group.isPacked = group.totalPacked > 0;
      group.isFullyPacked = group.totalPacked === group.totalOrdered;
    }

    return Array.from(groupedMap.values()).map((g) => ({
      ...g,
      slots: Array.from(g.slots.values()),
      deliveryLocations: Array.from(g.deliveryLocations),
      totalOrdered: Number(g.totalOrdered) || 0,
      totalPacked: Number(g.totalPacked) || 0,
      remaining: Math.max(
        0,
        (Number(g.totalOrdered) || 0) - (Number(g.totalPacked) || 0)
      ),
    }));
  }, [packingData, filters, packer, userRole, packerHubName]);
}

const PackerOrders = () => {
  const [userRole, setUserRole] = useState(null);
  const [packerData, setPackerData] = useState(null);
  const { hubs: allHubs } = useHubs();
  const [packerHubName, setPackerHubName] = useState(null);

  const [filters, setFilters] = useState(() => {
    try {
      const raw = sessionStorage.getItem("packer:filters:v1");
      return raw
        ? JSON.parse(raw)
        : {
            hub: "all",
            slot: "all",
            deliveryLocation: "all",
            deliveryLocations: [],
          };
    } catch {
      return {
        hub: "all",
        slot: "all",
        deliveryLocation: "all",
        deliveryLocations: [],
      };
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem("packer:filters:v1", JSON.stringify(filters));
    } catch {}
  }, [filters]);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);

    if (role === "packer") {
      const pData = getPackerData();
      setPackerData(pData);
    }
  }, []);

  useEffect(() => {
    if (
      userRole === "packer" &&
      packerData?.hubs &&
      Array.isArray(allHubs) &&
      allHubs.length > 0
    ) {
      const hubName = getPackerHubName(packerData.hubs, allHubs);
      if (hubName) {
        setPackerHubName(hubName);
        // Auto-select the hub for packers
        setFilters((prev) => ({
          ...prev,
          hub: hubName,
        }));
      }
    }
  }, [userRole, packerData, allHubs]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedItemForSlot, setSelectedItemForSlot] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const lastGoodDataRef = useRef(null);

  // SWR data
  const { data, error, isValidating, refresh, mutate } = usePackingData();
  const packingData = data?.groupedData || [];

  // Keep a ref to the last good data for instant fallback
  useEffect(() => {
    if (Array.isArray(packingData) && packingData.length > 0) {
      lastGoodDataRef.current = packingData;
    }
  }, [packingData]);

  const availableFilters = useAvailableFilters(
    packingData,
    userRole,
    packerData,
    allHubs,
    packerHubName
  );
  const summary = useSummary(
    packingData,
    filters,
    packerData || { hubs: [] },
    userRole,
    packerHubName
  );
  const groupedItems = useGroupedItems(
    packingData,
    filters,
    packerData || { hubs: [] },
    userRole,
    packerHubName
  );

  const loading = !data && !error && !lastGoodDataRef.current;

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleDeliveryLocationSelect = (location) => {
    if (location === "all") {
      setFilters((prev) => ({
        ...prev,
        deliveryLocations: [],
        deliveryLocation: "all",
      }));
    } else if (!filters.deliveryLocations.includes(location)) {
      setFilters((prev) => ({
        ...prev,
        deliveryLocations: [...prev.deliveryLocations, location],
        deliveryLocation: "all",
      }));
    }
  };
  const removeDeliveryLocation = (locationToRemove) => {
    setFilters((prev) => ({
      ...prev,
      deliveryLocations: prev.deliveryLocations.filter(
        (l) => l !== locationToRemove
      ),
    }));
  };
  const clearAllDeliveryLocations = () => {
    setFilters((prev) => ({ ...prev, deliveryLocations: [] }));
  };

  // Smooth manual refresh with background revalidate
  const handleRefresh = async () => {
    console.log("[v0] manual refresh requested");
    await mutate();
    setLastRefreshed(new Date());
  };

  const handlePackedClick = (item) => {
    setSelectedItemForSlot(item);
    setShowSlotModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsUpdating(false);
  };
  const handleCloseSlotModal = () => {
    setShowSlotModal(false);
    setIsUpdating(false);
  };

  const handleSlotSelect = async (slot) => {
    setShowSlotModal(false);
    try {
      const url = `${API_BASE_URL}/packing/today/individual?name=${encodeURIComponent(
        selectedItemForSlot.name
      )}&hub=${selectedItemForSlot.hub[0]}&slot=${slot}`;
      const res = await fetchWithTimeout(url, {}, 8000);
      if (res?.success && Array.isArray(res?.data)) {
        const individualItems = res.data;
        const packedCount = individualItems.filter((it) => it.isPacked).length;
        const totalCount = individualItems.length;
        setSelectedItem({
          ...selectedItemForSlot,
          slot,
          individualItems,
          totalOrdered: totalCount,
          packed: packedCount,
          isPacked: packedCount > 0,
          isFullyPacked: packedCount === totalCount,
        });
        setShowModal(true);
      } else {
        alert("No individual items found for this slot");
      }
    } catch (err) {
      console.log("[v0] individual items fetch failed, using fast fallback");
      alert("Error fetching individual items: " + err.message);
    }
  };

  // Optimistic update using SWR mutate to keep UI instant
  const updateIndividualPackingStatus = async (individualItemId, isPacked) => {
    if (!selectedItem || !selectedItemForSlot) return;
    setIsUpdating(true);

    // Prepare optimistic update for the grouped list and details modal
    const optimisticUpdater = (current) => {
      if (!current) return current;
      const copy = {
        ...current,
        groupedData: [...(current.groupedData || [])],
      };

      // Update matching grouped item
      copy.groupedData = copy.groupedData.map((it) => {
        const itemHubs = Array.isArray(it.hub)
          ? it.hub
          : [it.hub].filter(Boolean);
        const matches =
          it.name === selectedItemForSlot.name &&
          itemHubs[0] === selectedItemForSlot.hub[0] &&
          it.slot === selectedItem.slot;
        if (!matches) return it;

        // Recalculate packed based on modal state
        const currentItems = (selectedItem.individualItems || []).map((x) =>
          x._id === individualItemId ? { ...x, isPacked } : x
        );
        const newPacked = currentItems.filter((x) => x.isPacked).length;
        const ordered = Number(it.totalOrdered || it.ordered || 0);
        return {
          ...it,
          packed: newPacked,
          totalPacked: newPacked,
          isPacked: newPacked > 0,
          isFullyPacked: newPacked === ordered,
        };
      });

      return copy;
    };

    // Apply optimistic global mutate
    await globalMutate(
      SWR_KEY,
      (current) => optimisticUpdater(current),
      false // don't revalidate yet
    );

    // Update modal immediately
    setSelectedItem((prev) => {
      if (!prev) return prev;
      const updatedIndividualItems = (prev.individualItems || []).map((it) =>
        it._id === individualItemId
          ? { ...it, isPacked, packed: isPacked ? 1 : 0 }
          : it
      );
      const packedCount = updatedIndividualItems.filter(
        (x) => x.isPacked
      ).length;
      const totalCount = updatedIndividualItems.length;
      return {
        ...prev,
        individualItems: updatedIndividualItems,
        packed: packedCount,
        isPacked: packedCount > 0,
        isFullyPacked: packedCount === totalCount,
      };
    });

    // Make API call
    try {
      const res = await fetch(
        `${API_BASE_URL}/packing/update-individual-packed`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packingId: individualItemId, isPacked }),
        }
      );
      const json = await res.json();
      if (!json?.success) {
        throw new Error(json?.message || "Failed to update packing status");
      }
      // Background revalidate eventually to sync
      mutate();
    } catch (err) {
      // Revert optimistic update on failure
      console.log("[v0] update failed, reverting:", err.message);
      await globalMutate(SWR_KEY, undefined, true); // revalidate to restore
      alert("Update failed: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (data && Array.isArray(data.groupedData) && !isValidating) {
      setLastRefreshed(new Date());
    }
  }, [data, isValidating]);

  useEffect(() => {
    const onFocus = () => {
      console.log("[v0] focus/visible -> revalidate");
      mutate().then(() => setLastRefreshed(new Date()));
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mutate]);

  useEffect(() => {
    const id = setInterval(() => {
      mutate().then(() => setLastRefreshed(new Date()));
    }, 20000);
    return () => clearInterval(id);
  }, [mutate]);

  useEffect(() => {
    const id = setTimeout(() => {
      mutate().then(() => setLastRefreshed(new Date()));
    }, 300);
    return () => clearTimeout(id);
  }, [mutate]);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-black mb-1">Item Packer</h2>
              <p className="text-muted mb-0">
                Manage and track order packing progress
                {lastRefreshed && (
                  <span className="text-success fw-bold ms-2">
                    Last refreshed: {lastRefreshed.toLocaleTimeString()}
                  </span>
                )}
                {isValidating && (
                  <span className="text-warning fw-bold ms-2">
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    <Spinner
                      animation="border"
                      size="sm"
                      style={{ width: "1rem", height: "1rem" }}
                    />
                  </span>
                )}
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="d-flex gap-2">
                <Link to="/packer-dashboard">
                  <button
                    className="btn packer-toggle-btn"
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    <FaTable className="me-2" /> View Orders
                  </button>
                </Link>
                <button
                  className="btn packer-toggle-btn"
                  style={{
                    backgroundColor: "#6B8E23",
                    color: "white",
                    fontWeight: "bold",
                  }}
                  onClick={handleRefresh}
                  disabled={isValidating}
                >
                  <FaListAlt className="me-2" /> Refresh
                </button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      {!loading && summary.totalGroups > 0 && (
        <Row className="mb-4">
          <Col md={4}>
            <Card
              className="text-center"
              style={{ backgroundColor: "#aeaeae" }}
            >
              <Card.Body>
                <Card.Title className="text-black fs-2 fw-bold">
                  {summary.totalOrdered || 0}
                </Card.Title>
                <Card.Text className="text-black">Total Ordered</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="text-center"
              style={{ backgroundColor: "#6B8E23" }}
            >
              <Card.Body>
                <Card.Title className="text-white fs-2 fw-bold">
                  {summary.totalPacked || 0}
                </Card.Title>
                <Card.Text className="text-white">Packed Items</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="text-center"
              style={{ backgroundColor: "#FFD700" }}
            >
              <Card.Body>
                <Card.Title className="text-black fs-2 fw-bold">
                  {summary.remainingItems || 0}
                </Card.Title>
                <Card.Text className="text-black">Remaining Items</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4" style={{ backgroundColor: "#fff8dc" }}>
        <Card.Body>
          <Row>
            {userRole === "admin" && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Hub</Form.Label>
                  <Form.Select
                    value={filters.hub}
                    onChange={(e) => handleFilterChange("hub", e.target.value)}
                  >
                    <option value="all">All Hubs</option>
                    {availableFilters.hubs.map((hub) => (
                      <option key={hub} value={hub}>
                        {hub}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col md={userRole === "admin" ? 3 : 4}>
              <Form.Group>
                <Form.Label>Delivery Slot</Form.Label>
                <Form.Select
                  value={filters.slot}
                  onChange={(e) => handleFilterChange("slot", e.target.value)}
                >
                  <option value="all">All Slots</option>
                  {availableFilters.slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={userRole === "admin" ? 4 : 5}>
              <Form.Group>
                <Form.Label>Delivery Location</Form.Label>
                <Form.Select
                  value="all"
                  onChange={(e) => handleDeliveryLocationSelect(e.target.value)}
                >
                  <option value="all">Select Locations (Multi-select)</option>
                  {availableFilters.deliveryLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </Form.Select>

                {filters.deliveryLocations.length > 0 && (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Selected Locations:</small>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-danger"
                        onClick={clearAllDeliveryLocations}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {filters.deliveryLocations.map((location) => (
                        <Badge
                          key={location}
                          bg="primary"
                          className="d-flex align-items-center gap-1"
                        >
                          {location}
                          <FaTimes
                            className="cursor-pointer"
                            style={{ cursor: "pointer", fontSize: "0.8rem" }}
                            onClick={() => removeDeliveryLocation(location)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={userRole === "admin" ? 2 : 3}>
              <div className="text-muted small">
                <div>Showing:</div>
                {userRole === "admin" && (
                  <div>
                    <strong>
                      {filters.hub === "all" ? "All Hubs" : filters.hub}
                    </strong>
                  </div>
                )}
                <div>
                  <strong>
                    {filters.slot === "all" ? "All Slots" : filters.slot}
                  </strong>
                </div>
                <div>
                  <strong>
                    {filters.deliveryLocations.length > 0
                      ? `${filters.deliveryLocations.length} location(s)`
                      : filters.deliveryLocation === "all"
                      ? "All Locations"
                      : filters.deliveryLocation}
                  </strong>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error Loading Data</Alert.Heading>
          <div className="mb-1">{error.message || "Failed to fetch data."}</div>
          {data?.__fromCache && (
            <small className="text-muted">
              Showing cached data. We'll refresh in the background when the
              network is available.
            </small>
          )}
        </Alert>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading packing data...</p>
        </div>
      )}

      {!loading && groupedItems.length > 0 && (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Packing Summary - All Items</h5>
            <Badge bg="primary">{groupedItems.length} unique items</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="packer-table-responsive shadow-lg rounded">
              <table className="table table-hover">
                <thead style={{ backgroundColor: "#6B8E23", color: "white" }}>
                  <tr>
                    <th>Category</th>
                    {userRole === "admin" && <th>Hub</th>}
                    <th>Available Slots</th>
                    <th>Total Ordered</th>
                    <th>Total Packed</th>
                    <th>Yet to Pack</th>
                    <th>Pack Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedItems.map((item, index) => {
                    const totalOrdered = Number(item.totalOrdered) || 0;
                    const totalPacked = Number(item.totalPacked) || 0;
                    const remainingQuantity = Math.max(
                      0,
                      totalOrdered - totalPacked
                    );
                    const isFullyPacked = remainingQuantity === 0;
                    const isPartiallyPacked = totalPacked > 0 && !isFullyPacked;

                    return (
                      <tr key={`${item.name}-${item.hub[0]}-${index}`}>
                        <td>
                          <strong
                            className="d-flex align-items-center gap-2 justify-content-center"
                            style={{ fontSize: "18px" }}
                          >
                            <span
                              className={`d-inline-block rounded-circle ${
                                item.category &&
                                item.category.toLowerCase() === "veg"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                              style={{ width: "12px", height: "12px" }}
                            ></span>
                            {item.categoryName}
                          </strong>
                          <br />
                          <small>{item.name}</small>
                        </td>
                        {userRole === "admin" && (
                          <td>
                            <Badge bg="secondary" style={{ fontSize: "18px" }}>
                              {item.hub[0]}
                            </Badge>
                          </td>
                        )}
                        <td>
                          <div className="d-flex flex-wrap gap-1 fs-6">
                            {item.slots.map((slotInfo, idx) => (
                              <Badge
                                key={idx}
                                bg={
                                  slotInfo.isFullyPacked
                                    ? "success"
                                    : slotInfo.isPacked
                                    ? "warning"
                                    : "outline-info"
                                }
                                style={{
                                  border: slotInfo.isFullyPacked
                                    ? "none"
                                    : "1px solid #8b4513",
                                  color: slotInfo.isFullyPacked
                                    ? "white"
                                    : "#8b4513",
                                }}
                              >
                                {slotInfo.slot} ({slotInfo.remaining || 0})
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary fs-6">
                            {totalOrdered}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isFullyPacked
                                ? "bg-success"
                                : isPartiallyPacked
                                ? "bg-warning"
                                : "bg-danger"
                            } fs-6`}
                          >
                            {totalPacked}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary fs-6">
                            {remainingQuantity}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={
                              remainingQuantity > 0
                                ? "success"
                                : "outline-success"
                            }
                            onClick={() => handlePackedClick(item)}
                            disabled={isFullyPacked}
                          >
                            {remainingQuantity > 0
                              ? `Pack Items`
                              : "All Packed"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {!loading && !error && groupedItems.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No packing items found</h5>
            <p className="text-muted">
              {Array.isArray(packingData) && packingData.length === 0
                ? "There are no packing items for today. Items will appear here when orders are placed."
                : "No items match the current filters. Try selecting different hub, slot, or location filters."}
            </p>
          </Card.Body>
        </Card>
      )}

      <Modal
        show={showSlotModal}
        onHide={handleCloseSlotModal}
        size="xxl" // Changed from xl to xxl
        style={{ maxWidth: "98vw" }} // Increased from 95vw to 98vw
        dialogClassName="modal-dialog-scrollable" // Added for better scrolling
      >
        <Modal.Header closeButton className="py-3">
          <Modal.Title className="h4">Select Delivery Slot</Modal.Title>{" "}
          {/* Increased font size */}
        </Modal.Header>
        <Modal.Body className="p-4">
          {" "}
          {/* Increased padding */}
          {selectedItemForSlot && (
            <div>
              <h5 className="mb-3">
                {" "}
                {/* Increased from h6 to h5 */}
                Packing: <strong>{selectedItemForSlot.name}</strong>
              </h5>
              <p className="text-muted fs-6">
                {" "}
                {/* Added font size */}
                Hub: {selectedItemForSlot.hub[0]} | Total Ordered:{" "}
                {selectedItemForSlot.totalOrdered || 0} | Total Packed:{" "}
                {selectedItemForSlot.totalPacked || 0}
              </p>

              <div className="row g-4">
                {" "}
                {/* Increased gap from g-3 to g-4 */}
                {selectedItemForSlot.slots.map((slotInfo, index) => (
                  <div key={index} className="col-lg-6 col-md-12">
                    {" "}
                    {/* Adjusted columns for tablets */}
                    <Card
                      className={`h-100 cursor-pointer ${
                        slotInfo.isFullyPacked
                          ? "border-success"
                          : "border-primary"
                      }`}
                      style={{
                        cursor: slotInfo.isFullyPacked ? "default" : "pointer",
                        opacity: slotInfo.isFullyPacked ? 0.7 : 1,
                        minHeight: "140px", // Added minimum height for better touch targets
                      }}
                      onClick={() =>
                        !slotInfo.isFullyPacked &&
                        handleSlotSelect(slotInfo.slot)
                      }
                    >
                      <Card.Body className="text-center p-4">
                        {" "}
                        {/* Increased padding */}
                        <h5 className="mb-3">{slotInfo.slot}</h5>{" "}
                        {/* Increased font size */}
                        <div className="mt-3">
                          {" "}
                          {/* Increased margin */}
                          <div className="mb-3">
                            {" "}
                            {/* Increased margin */}
                            <Badge bg="primary" className="fs-6 p-2">
                              {" "}
                              {/* Increased font size and padding */}
                              Ordered: {slotInfo.ordered || 0}
                            </Badge>
                          </div>
                          <div className="mb-3">
                            <Badge
                              bg={
                                (slotInfo.packed || 0) > 0
                                  ? "success"
                                  : "secondary"
                              }
                              className="fs-6 p-2"
                            >
                              Packed: {slotInfo.packed || 0}
                            </Badge>
                          </div>
                          <div>
                            <Badge
                              bg={
                                (slotInfo.remaining || 0) > 0
                                  ? "warning"
                                  : "success"
                              }
                              className="fs-6 p-2"
                            >
                              {(slotInfo.remaining || 0) > 0
                                ? `${slotInfo.remaining} to pack`
                                : "All packed"}
                            </Badge>
                          </div>
                        </div>
                        {slotInfo.isFullyPacked && (
                          <div className="mt-3">
                            <FaCheckCircle className="text-success fs-5" />{" "}
                            {/* Increased icon size */}
                            <small className="text-success ms-1 fs-6">
                              Fully Packed
                            </small>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Individual Packing Modal - Made larger */}
      {showModal && selectedItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-xxl modal-dialog-scrollable"
            style={{ maxWidth: "98vw" }}
          >
            <div className="modal-content">
              <div className="modal-header py-3">
                <h4 className="modal-title">
                  Packing: {selectedItem.name}
                  <small className="text-muted d-block fs-6 mt-1">
                    {selectedItem.unit} | {selectedItem.hub[0]} |{" "}
                    {selectedItem.slot}
                  </small>
                </h4>
                <button
                  className="btn-close"
                  onClick={handleCloseModal}
                  style={{ transform: "scale(1.2)" }}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row mb-5">
                  <div className="col-4 text-center">
                    <div className="card bg-light h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title text-muted mb-2">Total</h5>
                        <h3 className="mb-0 text-primary">
                          {selectedItem.totalOrdered || 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="card bg-light h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title text-muted mb-2">Packed</h5>
                        <h3 className="mb-0 text-success">
                          {selectedItem.packed || 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="card bg-light h-100">
                      <div className="card-body p-4">
                        <h5 className="card-title text-muted mb-2">
                          Remaining
                        </h5>
                        <h3 className="mb-0 text-warning">
                          {Math.max(
                            0,
                            (selectedItem.totalOrdered || 0) -
                              (selectedItem.packed || 0)
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {selectedItem.individualItems?.map((individualItem) => (
                    <div
                      key={individualItem._id}
                      className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-12"
                    >
                      {/* Changed from col-xl-3 col-lg-4 col-md-6 to col-xl-4 col-lg-4 col-md-4 for 3 columns */}
                      <div
                        className={`card h-100 cursor-pointer ${
                          individualItem.isPacked
                            ? "border-success bg-success"
                            : "border-warning bg-light"
                        }`}
                        style={{
                          transition: "all 0.2s",
                          cursor: "pointer",
                          minHeight: "120px",
                        }}
                        onClick={async () => {
                          await updateIndividualPackingStatus(
                            individualItem._id,
                            !individualItem.isPacked
                          );
                        }}
                      >
                        <div className="card-body text-center p-3 d-flex flex-column justify-content-center">
                          {/* Reduced padding from p-4 to p-3 for smaller boxes */}
                          <h6
                            className={`card-title mb-2 ${
                              individualItem.isPacked
                                ? "text-white"
                                : "text-dark"
                            }`}
                          >
                            {/* Changed from h5 to h6 for smaller text */}
                            {selectedItem.categoryName}
                          </h6>
                          <div className="mt-1">
                            {/* Reduced margin */}
                            {individualItem.isPacked ? (
                              <div className="text-white fs-6">
                                <FaCheckCircle className="me-1 fs-6" />
                                {/* Reduced icon size and margin */}
                                <span>Packed</span>
                              </div>
                            ) : (
                              <div className="text-dark fs-6">
                                <FaBox className="me-1 fs-6" />
                                <span>Click to Pack</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer py-3">
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default PackerOrders;
