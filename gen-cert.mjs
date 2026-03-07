import { execSync } from "child_process";
import { writeFileSync, existsSync } from "fs";

// Install selfsigned if needed
if (!existsSync("node_modules/selfsigned")) {
    console.log("Installing selfsigned...");
    execSync("npm install selfsigned --no-save", { stdio: "pipe" });
}

const { generate } = (await import("./node_modules/selfsigned/index.js")).default;

const attrs = [{ name: "commonName", value: "172.22.124.114" }];
const pems = await generate(attrs, {
    days: 365,
    keySize: 2048,
    extensions: [
        {
            name: "subjectAltName",
            altNames: [
                { type: 7, ip: "172.22.124.114" },
                { type: 2, value: "localhost" },
            ],
        },
    ],
});

writeFileSync("localhost.pem", pems.cert);
writeFileSync("localhost-key.pem", pems.private);
console.log("✅ Certificate files created: localhost.pem + localhost-key.pem");
