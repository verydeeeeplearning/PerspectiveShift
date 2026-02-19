-- Phase 3 Metrics: Aggregate views for relationship analytics

-- 1. Daily friend request rate
CREATE OR REPLACE VIEW v_daily_friend_requests AS
SELECT
  date_trunc('day', created_at)::date AS day,
  count(*) AS total_requests,
  count(*) FILTER (WHERE status = 'ACCEPTED') AS accepted,
  count(*) FILTER (WHERE status = 'DECLINED') AS declined,
  count(*) FILTER (WHERE status = 'SILENT_REJECTED') AS silent_rejected,
  CASE WHEN count(*) > 0
    THEN round(count(*) FILTER (WHERE status = 'ACCEPTED')::numeric / count(*)::numeric, 3)
    ELSE 0
  END AS acceptance_rate
FROM friend_requests
GROUP BY date_trunc('day', created_at)::date
ORDER BY day DESC;

-- 2. Daily realtime messaging activity
CREATE OR REPLACE VIEW v_daily_realtime_messages AS
SELECT
  date_trunc('day', created_at)::date AS day,
  count(*) AS total_messages,
  count(DISTINCT sender_id) AS active_senders,
  count(DISTINCT friendship_id) AS active_chats
FROM realtime_messages
GROUP BY date_trunc('day', created_at)::date
ORDER BY day DESC;

-- 3. Realtime conversion rate (friendships → chat)
CREATE OR REPLACE VIEW v_realtime_conversion AS
SELECT
  f.id AS friendship_id,
  f.created_at AS friendship_created_at,
  min(m.created_at) AS first_message_at,
  count(m.id) AS message_count,
  CASE WHEN count(m.id) > 0 THEN true ELSE false END AS has_chatted
FROM friendships f
LEFT JOIN realtime_messages m ON f.id = m.friendship_id
WHERE f.status = 'ACTIVE'
GROUP BY f.id, f.created_at;

-- 4. Offline meeting conversion rate
CREATE OR REPLACE VIEW v_offline_conversion AS
SELECT
  date_trunc('day', created_at)::date AS day,
  count(*) AS total_proposals,
  count(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed,
  count(*) FILTER (WHERE status = 'CANCELLED') AS cancelled,
  count(*) FILTER (WHERE status = 'COMPLETED') AS completed,
  CASE WHEN count(*) > 0
    THEN round(count(*) FILTER (WHERE status = 'CONFIRMED')::numeric / count(*)::numeric, 3)
    ELSE 0
  END AS confirm_rate
FROM offline_meeting_proposals
GROUP BY date_trunc('day', created_at)::date
ORDER BY day DESC;

-- 5. 30-day friendship retention (friendships still ACTIVE after 30 days)
CREATE OR REPLACE VIEW v_friendship_retention_30d AS
SELECT
  date_trunc('day', created_at)::date AS cohort_day,
  count(*) AS friendships_created,
  count(*) FILTER (
    WHERE status = 'ACTIVE'
    AND created_at <= now() - interval '30 days'
  ) AS still_active_after_30d,
  CASE
    WHEN count(*) FILTER (WHERE created_at <= now() - interval '30 days') > 0
    THEN round(
      count(*) FILTER (WHERE status = 'ACTIVE' AND created_at <= now() - interval '30 days')::numeric
      / count(*) FILTER (WHERE created_at <= now() - interval '30 days')::numeric,
      3
    )
    ELSE NULL
  END AS retention_rate
FROM friendships
GROUP BY date_trunc('day', created_at)::date
ORDER BY cohort_day DESC;
