const http = require("http");
http.get("http://127.0.0.1:5001/api/course/website-list?category=certification&subcategory=ai-courses", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("Response JSON length:", data.length, "Docs:", JSON.parse(data).data?.length || 0));
}).on("error", err => console.error("Error:", err.message));

http.get("http://127.0.0.1:5001/api/course/website-list?category=iit&subcategory=iit-roorkee", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("IIT Response JSON length:", data.length, "Docs:", JSON.parse(data).data?.length || 0));
}).on("error", err => console.error("Error:", err.message));
