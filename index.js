const http = require('http');
const fs = require('fs');
let articles = require('./articles.json');
const articlesJS = require('./articles.js');
const commentsJS = require('./comments.js');
const hostname = '127.0.0.1';
const port = 3005;
const Articles = new articlesJS.Articles();
const Comments = new commentsJS.Comments();

const handlers = {
    '/api/articles/readall': Articles.readAll,
    '/api/articles/read': Articles.read,
    '/api/articles/create': Articles.create,
    '/api/articles/update': Articles.update,
    '/api/articles/delete': Articles.deleteArticle,
    '/api/comments/create': Comments.createComments,
    '/api/comments/delete': Comments.deleteComments,
    '/api/logs': displayLOG
};
let LOG = {};
const server = http.createServer((req, res) => {
    parseBodyJson(req, (err, payload) => {
        const handler = getHandler(req.url);

        Logging(req.url, payload);

        handler(req, res, payload, (err, result) => {
            if (err) {
                res.statusCode = err.code;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(err));
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
        });
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({code: 404, message: 'Not Found'});
}

function parseBodyJson(req, cd) {
    let body = [];
    req.on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        if (body.length !== 0) {
            let params = JSON.parse(body);
            cd(null, params);
        }
        else {
            let params = null;
            cd(null, params);
        }
    });
}

function Logging(url, body) {
    fs.readFile('LOG.json', function (err, data) {
        if(data.length === 0){
            fs.writeFile('LOG.json', JSON.stringify([]), (err) => {
                if (err) console.log('Err in create LOG');
                Logging(url,body);
            });
        }
        else{
            LOG.date = new Date().toLocaleString();
            LOG.url = url;
            LOG.body = body;
            let json = JSON.parse(data);
            json.push(LOG);
            fs.writeFile('LOG.json', JSON.stringify(json,null,'\t')+'\n', (err) => {
                if (err) console.log('Err in create LOG');
            });
        }
    });
}

function displayLOG(req, res, payload, cb) {
    fs.readFile('LOG.json', function (err,data) {
        if(err) console.log(err);
        cb(null, JSON.parse(data));
    });
}