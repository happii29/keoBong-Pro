# KeoBong Pro n8n Workflows

This document defines the automation workflows prepared for future n8n webhook integration.

## Webhook Contract

KeoBong Pro sends workflow events to the configured `N8N_WEBHOOK_URL` with `POST`.

Recommended headers:

```http
content-type: application/json
x-keobong-secret: <N8N_WEBHOOK_SECRET>
```

Recommended event shape:

```json
{
  "id": "evt_20260517_001",
  "name": "attendance.link_send",
  "teamId": "team_demo",
  "createdAt": "2026-05-17T02:30:00.000Z",
  "payload": {
    "matchId": "match_20260524_2030",
    "teamSlug": "demo",
    "scheduledFor": "2026-05-22T03:00:00.000Z"
  }
}
```

Inbound callbacks from n8n can use:

```text
POST /api/webhooks/n8n
```

The route already validates `x-keobong-secret` when `N8N_WEBHOOK_SECRET` is configured.

## 1. Auto tạo trận

Event name: `match.auto_create`

Purpose:
Create the next match automatically from the team's recurring schedule.

Trigger:
Weekly cron in n8n, for example Thursday 09:00.

Input payload:

```json
{
  "teamId": "team_demo",
  "teamSlug": "demo",
  "venue": "Sân Phú Thọ - Sân 3",
  "kickoffAt": "2026-05-24T13:30:00.000Z",
  "format": "7v7",
  "opponent": "FC Anh Em"
}
```

Workflow steps:

1. Receive scheduled trigger.
2. Check whether a match already exists for the same team and kickoff time.
3. Create match as `draft` or `open`.
4. Store venue, opponent, format, expected cost, and kickoff time.
5. Emit or schedule the next workflow `attendance.link_send`.

Expected output:

```json
{
  "accepted": true,
  "workflowId": "match.auto_create",
  "matchId": "match_20260524_2030"
}
```

Failure handling:
If duplicate match exists, return accepted with a duplicate marker and do not create a second match.

## 2. Gửi link điểm danh trước 2 ngày

Event name: `attendance.link_send`

Purpose:
Send the attendance link to the Zalo group 2 days before kickoff.

Trigger:
Scheduled by match kickoff time minus 48 hours.

Input payload:

```json
{
  "teamId": "team_demo",
  "matchId": "match_20260524_2030",
  "zaloThreadId": "zalo_group_001",
  "attendanceUrl": "https://app.keobong.pro/teams/demo/matches?match=match_20260524_2030",
  "message": "[Demo] Điểm danh trận Chủ nhật\nSân Phú Thọ - Sân 3 · 20:30"
}
```

Workflow steps:

1. Load match and team metadata.
2. Generate attendance URL with match context.
3. Render Zalo message template.
4. Send message to configured Zalo group.
5. Mark attendance request as sent.
6. Schedule `attendance.pending_remind`.

Expected output:

```json
{
  "accepted": true,
  "workflowId": "attendance.link_send",
  "messageId": "zalo_msg_001"
}
```

Failure handling:
If Zalo sending fails, retry with exponential backoff and record failure status for UI.

## 3. Nhắc người chưa điểm danh

Event name: `attendance.pending_remind`

Purpose:
Remind players who have not responded to attendance.

Trigger:
Usually 1 day before kickoff, or custom reminders at fixed hours.

Input payload:

```json
{
  "teamId": "team_demo",
  "matchId": "match_20260524_2030",
  "pendingPlayerIds": ["p6", "p9"],
  "zaloThreadId": "zalo_group_001"
}
```

Workflow steps:

1. Fetch attendance list.
2. Filter players with `pending` status.
3. Build mention list or direct reminder content.
4. Send reminder through Zalo.
5. Save reminder timestamp per player.

Expected output:

```json
{
  "accepted": true,
  "workflowId": "attendance.pending_remind",
  "remindedCount": 2
}
```

Failure handling:
Skip players without contact mapping and include them in `skippedPlayerIds`.

## 4. Chốt trận trước giờ đá 2 tiếng

Event name: `match.lock_before_kickoff`

Purpose:
Lock the match roster 2 hours before kickoff and prepare final lineup context.

Trigger:
Kickoff time minus 2 hours.

Input payload:

```json
{
  "teamId": "team_demo",
  "matchId": "match_20260524_2030",
  "kickoffAt": "2026-05-24T13:30:00.000Z"
}
```

Workflow steps:

1. Load latest attendance statuses.
2. Mark match as `locked`.
3. Separate going, late, absent, goalkeeper, and pending players.
4. Optionally call team balancing logic when enough players are available.
5. Send final roster summary to Zalo.
6. Trigger `fund.calculate`.

Expected output:

```json
{
  "accepted": true,
  "workflowId": "match.lock_before_kickoff",
  "locked": true,
  "goingCount": 12
}
```

Failure handling:
If minimum player count is not met, mark status as warning and send organizer alert.

## 5. Tính quỹ

Event name: `fund.calculate`

Purpose:
Calculate pitch fee, water fee, per-player amount, paid members, and unpaid members.

Trigger:
After match lock, or manually from finance module.

Input payload:

```json
{
  "teamId": "team_demo",
  "matchId": "match_20260524_2030",
  "pitchFee": 720000,
  "waterFee": 180000,
  "extraFee": 0,
  "chargeablePlayerIds": ["p1", "p2", "p3", "p4"]
}
```

Workflow steps:

1. Read locked attendance list.
2. Calculate total expense.
3. Divide cost by chargeable players.
4. Create payment requests.
5. Update fund ledger with expected income and expenses.
6. Send payment summary to Zalo.

Expected output:

```json
{
  "accepted": true,
  "workflowId": "fund.calculate",
  "totalExpense": 900000,
  "perPlayerAmount": 120000
}
```

Failure handling:
If there are no chargeable players, do not create ledger entries and return a validation error.

## 6. Update ranking

Event name: `ranking.update`

Purpose:
Update player rankings after match stats are submitted.

Trigger:
After match completion, for example 23:00 on match day, or manually after stat entry.

Input payload:

```json
{
  "teamId": "team_demo",
  "matchId": "match_20260524_2030",
  "stats": [
    { "playerId": "p1", "goals": 2, "assists": 1, "mvp": true, "won": true },
    { "playerId": "p2", "goals": 0, "assists": 2, "mvp": false, "won": true }
  ]
}
```

Workflow steps:

1. Validate match is completed or stats are approved.
2. Upsert player match stats.
3. Recalculate goals, assists, MVP count, attendance rate, and win rate.
4. Re-rank players by rating formula.
5. Publish top player summary to dashboard and optional Zalo message.

Expected output:

```json
{
  "accepted": true,
  "workflowId": "ranking.update",
  "updatedPlayers": 12
}
```

Failure handling:
If stats are incomplete, keep previous ranking and return warning status.

## Future Integration Notes

- Keep workflow names aligned with `N8nWorkflowName` in `src/services/n8n/n8n.types.ts`.
- Use one n8n Webhook node as the entrypoint, then route by `name`.
- Store external `workflowId`, `messageId`, and retry count for observability.
- Use idempotency keys based on `teamId`, `matchId`, and workflow name.
- The UI settings module currently stores mock state locally; persistence can later move to Supabase team settings.
- Server dispatch is prepared through `dispatchN8nWorkflow`, which posts to `N8N_WEBHOOK_URL`.
