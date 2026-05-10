export default function handler(req, res) {
  res.status(200).json({ 
    status: "JS Ping OK", 
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
}
