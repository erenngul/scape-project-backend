const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

async function getHtml(req, res, path = '', pageIndex) {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        let complaintList = [];
        if (path === "game") {
            await page.goto(`https://www.sikayetvar.com/geforce-now-powered-by-game?page=${pageIndex}`);
        }
        else {
            await page.goto(`https://www.sikayetvar.com/${path === '' ? '' : path + '/'}${req.params.brand}?page=${pageIndex}`);
        }
        const complaints = await page.$$eval('.card-v2', (elements) => elements.map((e) => {
            if (e.querySelector('.complaint-hidden')) {
                return;
            }
            return {
                title: e.querySelector('.complaint-title').innerText,
                username: e.querySelector('.username').innerText,
                time: e.querySelector('.time').innerText,
                description: e.querySelector('.complaint-description').innerText,
                link: e.querySelector('.complaint-title a').href
            };
        }));
        complaintList.push(complaints);
        complaintList = complaintList.flat();
        console.log(complaintList);
        res.json(complaintList);
        await browser.close();
    }
    catch (err) {
        res.json([{
            title: "Hata:",
            username: "",
            time: "",
            description: "Sayfa yüklenemedi.",
            link: ""
        }]);
    }
}

app.get("/:brand/:pageIndex", (req, res) => {
    if (req.params.brand === "game") {
        getHtml(req, res, "game", parseInt(req.params.pageIndex));
    }
    else {
        getHtml(req, res, '', parseInt(req.params.pageIndex));
    }
});

app.get("/turkcell/:brand/:pageIndex", (req, res) => {
    getHtml(req, res, "turkcell", parseInt(req.params.pageIndex));
});

app.listen(5000, () => console.log("Server started on port 5000"));