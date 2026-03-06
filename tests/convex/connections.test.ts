import { describe, it, expect } from "vitest";

type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "accepted";

function getStatus(
  connections: { requester_id: string; receiver_id: string; status: string }[],
  myId: string,
  otherId: string
): ConnectionStatus {
  const conn = connections.find(
    (c) =>
      (c.requester_id === myId && c.receiver_id === otherId) ||
      (c.requester_id === otherId && c.receiver_id === myId)
  );
  if (!conn) return "none";
  if (conn.status === "accepted") return "accepted";
  return conn.requester_id === myId ? "pending_sent" : "pending_received";
}

describe("connection status logic", () => {
  it("none when no connection exists", () => {
    expect(getStatus([], "me", "other")).toBe("none");
  });

  it("pending_sent when I sent the request", () => {
    const conns = [{ requester_id: "me", receiver_id: "other", status: "pending" }];
    expect(getStatus(conns, "me", "other")).toBe("pending_sent");
  });

  it("pending_received when other sent the request", () => {
    const conns = [{ requester_id: "other", receiver_id: "me", status: "pending" }];
    expect(getStatus(conns, "me", "other")).toBe("pending_received");
  });

  it("accepted when connection is accepted", () => {
    const conns = [{ requester_id: "me", receiver_id: "other", status: "accepted" }];
    expect(getStatus(conns, "me", "other")).toBe("accepted");
  });
});
