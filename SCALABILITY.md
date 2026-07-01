# Scalability notes

A few thoughts on what I'd change if this API had to handle real production
traffic instead of a handful of test requests.

## Where the bottlenecks would show up first

The task list endpoint (`GET /tasks`) is the one that gets hit hardest in a
real app, since dashboards tend to poll it. Right now it hits the database
on every call. There's already an optional caching layer wired in
(`src/config/cache.js`) using Redis with a short TTL per user/query
combination, so turning that on in production is just a matter of setting
`REDIS_URL` — the code path is already there, it just no-ops without it.

## Database

- Add indexes on `tasks.ownerId` and `tasks.status` once the table has real
  volume, since those are the columns every query filters on.
- Move from `sequelize.sync()` to proper migrations (`sequelize-cli`) before
  this ever touches a shared environment. Sync is fine for a take-home
  project, not for a team working against the same schema.
- If read traffic grows a lot faster than writes (typical for a task
  dashboard), a read replica with Sequelize's read/write connection
  splitting would take load off the primary without any application code
  changes.
- MySQL/Postgres both scale vertically pretty far before this is a real
  problem — I wouldn't reach for sharding until there's an actual reason to.

## API layer

- The app is already stateless (JWT auth, no server-side sessions), so
  horizontal scaling is just "run more instances behind a load balancer."
  Nothing in the code assumes it's the only instance running.
- Rate limiting is currently only on `/auth/login`. In production I'd put a
  general rate limiter in front of everything (or push that up to an API
  gateway / nginx layer) so a single client can't hammer any endpoint.
- If the task entity grows more complex logic over time (notifications,
  attachments, activity history), splitting auth and tasks into separate
  services makes sense. At this size, splitting them now would just be
  premature complexity for no real benefit.

## Deployment

- The included `Dockerfile` and `docker-compose.yml` are enough to get this
  running consistently anywhere. For a real deployment I'd put it behind an
  nginx or ALB, run at least two instances, and point health checks at
  `GET /health`.
- Logging is currently just `morgan` to stdout, which is actually the right
  call for containers — let the platform (CloudWatch, Docker logs, etc.)
  aggregate it rather than writing to a file on disk.

## What I'd explicitly avoid doing right now

Microservices, Kubernetes, and message queues would all be over-engineering
for an app with one secondary entity and a handful of endpoints. The value
of the current structure (routes → controllers → models, versioned under
`/api/v1`) is that each of the changes above can happen incrementally
without a rewrite, whenever traffic actually calls for it.
