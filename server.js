const express = require("express");
const app = express();
// const port = process.env.PORT || 3000;
const port = 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
  res.send("hello wolrd");
});


app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>Command line execution error：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>Command line execution results：\n" + stdout + "</pre>");
    }
  });
});

app.get("/start", (req, res) => {
  let cmdStr =
    "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Command line execution error：" + err);
    } else {
      res.send("Command line execution results：" + "Started successfully!");
    }
  });
});

app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Command line execution error: " + err);
    } else {
      res.send(
        "Command line execution results：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

app.get("/test", (req, res) => {
  fs.writeFile("./test.txt", "Here is the content of the newly created file!", function (err) {
    if (err) res.send("Failed to create file, file system permissions are read-only：" + err);
    else res.send("The file was created successfully and the file system permissions are not read-only.：");
  });
});

app.get("/download", (req, res) => {
  download_web((err) => {
    if (err) res.send("Download file failed");
    else res.send("Download file successfully");
  });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/api": "/qwe",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
  })
);

function keepalive() {
  let render_app_url = "https://lumbar-pentagonal-glue.glitch.me";
  exec("curl " + render_app_url, function (err, stdout, stderr) {
    if (err) {
      console.log("Keep alive-request home page-command line execution error：" + err);
    } else {
      console.log("Keep alive - request homepage - command line execution is successful, response message:" + stdout);
    }
  });

  exec("curl " + render_app_url + "/status", function (err, stdout, stderr) {
    if (!err) {
      if (stdout.indexOf("./web.js -c ./config.json") != -1) {
        console.log("web is running");
      } else {
        exec(
          "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("Keep alive-call up web-command line execution error：" + err);
            } else {
              console.log("Keep alive - call up web - command line execution successful!");
            }
          }
        );
      }
    } else console.log("Keep Alive - Request Server Process Table - Command Line Execution Error: " + err);
  });
}
setInterval(keepalive, 9 * 1000);

function download_web(callback) {
  let fileName = "web.js";
  let url =
    "https://github.com/santa2021/glitch/blob/main/web.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) callback("Download file failed");
      else callback(null);
    });
}
download_web((err) => {
  if (err) console.log("Initialization - Failed to download web file");
  else console.log("Initialization-Download web file successfully");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
