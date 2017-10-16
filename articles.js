const fs = require('fs');
let articles = require('./articles.json');
const validator = require('./validator.js');


class Articles {

    readAll(req, res, data, cb) {
        let parameters = validator.isValid(req, res, data, cb);
        cb(null, Sort(parameters, function (data){
            let ret = JSON.parse(JSON.stringify(articles));
            return ret.splice((data.page - 1)*data.limit, data.limit);
        }));
    };

    read(req, res, data, cb) {
        if(validator.isValid(req,res,data,cb)){
            let result = articles.find(x => x.id === data.id);
            cb(null, result);
        }
        else cb(null,{"code": 400,"message":"Request invalid"});
    };

    create(req, res, data, cb) {
        if(validator.isValid(req,res,data,cb)){
            data.id = Date.now();
            data.data = Date.now();
            data.comments = [];
            articles.push(data);
            updateArticles();
            cb(null, data);
        }
        else cb(null,{"code": 400,"message":"Request invalid"});
    };

    update(req, res, data, cb) {
        if(validator.isValid(req,res,data,cb)){
            for (let i = 0; i < articles.length; i++) {
                if (articles[i].id === data.id)
                    Object.assign(articles[i], data);
            }
            updateArticles();
            cb(null, {"message": "Article is update"});
        }
        else cb(null,{"code": 400,"message":"Request invalid"});
    };

    deleteArticle(req, res, data, cb) {
        if(validator.isValid(req,res,data,cb)){
            for (let i = 0; i < articles.length; i++) {
                if (articles[i].id === data.id) articles.splice(articles.findIndex(x => x.id === data.id), 1);
            }
            updateArticles();
            cb(null, {"message": "Article is delete"});
        }
        else cb(null,{"code": 400,"message":"Request invalid"});
    };
}

function updateArticles() {
    fs.writeFile('articles.json', JSON.stringify(articles, null, '\t'), function (err) {
        if (err) console.log(err);
    });
}
function Sort(data, callback) {
    switch (data.sortField) {
        case 'comments': {
            if (data.sortOrder === 'desc')
                articles.sort(function (a, b) {
                    return b.comments.length - a.comments.length;
                });
            else
                articles.sort(function (a, b) {
                    return a.comments.length - b.comments.length;
                });
        }
            ;
            break;
        default : {
            if (data.sortOrder === 'desc')
                articles.sort(function (a, b) {
                    if (a[data.sortField] < b[data.sortField]) return -1;
                    if (a[data.sortField] > b[data.sortField]) return 1;
                    return 0;
                });
            else
                articles.sort(function (a, b) {
                    if (a[data.sortField] > b[data.sortField]) return -1;
                    if (a[data.sortField] < b[data.sortField]) return 1;
                    return 0;
                });
        }
            ;
            break;
    }
    return callback(data);
}
exports.Articles = Articles;
