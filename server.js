const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });

  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Veloria Payments</title>
        <style>
          body{
            background:#0f0f0f;
            color:white;
            font-family:Arial;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            margin:0;
          }

          .box{
            text-align:center;
          }

          h1{
            font-size:50px;
            margin-bottom:10px;
          }

          p{
            color:#aaa;
            font-size:18px;
          }
        </style>
      </head>

      <body>
        <div class="box">
          <h1>Veloria Payments</h1>
          <p>FABMISR integration is running successfully.</p>
        </div>
      </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log("Server running");
});
