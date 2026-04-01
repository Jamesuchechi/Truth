console.time("fetch")
fetch("https://giving-orca-68899.upstash.io").then(res => {
  console.log("status:", res.status)
  console.timeEnd("fetch")
}).catch(console.error)
