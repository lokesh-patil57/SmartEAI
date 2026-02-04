export function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'SmartEAI',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
