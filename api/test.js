// Absolute minimum function — no TS, no imports, no config
module.exports = (req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
};
