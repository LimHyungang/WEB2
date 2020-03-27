var url = require('url');
var db = require('./db');
var qs = require('querystring');
var template = require('./template.js');

exports.home = function (request, response) {
    db.query(`select * from topic`, function(error, topics) {
        db.query(`select * from author`, function(error2, authors) {
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(title, list, 
                `
                ${template.authorTable(authors)}
                <style>
                    table {
                        border-collapse : collapse;
                    }
                    td {
                        border : 1px solid black; 
                    }
                </style>
                <form action="/author/process_create" method="post">
                    <p>
                        <input type="text" name="name" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" value="create">
                    </p>
                </form>
                `,``                 
            );
            response.writeHead(200);
            response.end(html);
            });
    });
}

exports.process_create = function(request, response) {
    // body 정의 ~ request.on() 선언 : post방식으로 넘어온 데이터를 받는 로직
    var body = '';
    request.on('data', function(data) {  // 수신하는 데이터가 너무 커서 생기는 문제를 방지하기 위해 데이터를 분할하여 보낸다. 분할된 데이터가 들어올 때 마다 이 콜백 메서드가 실행된다. data == 분할되어 들어온 데이터.
      body = body + data;
    });
    request.on('end', function() {  // 더이상 들어올 데이터가 없을 때 실행되는 콜백 메서드.
      var post = qs.parse(body);
      db.query(`insert into author (name, profile) 
                values (?, ?)`, 
                [post.name, post.profile], 
                function(error, result) {
                  if (error) throw error;
                  response.writeHead(302, {Location : `/author`});
                  response.end();
                }
      );
    });
}

exports.update = function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;  // queryString 정보
    db.query(`select * from topic`, function(error, topics) {
        db.query(`select * from author`, function(error2, authors) {
            db.query(`select * from author where id =?`, [queryData.id], function(error3, author) {
                var title = 'author';
                var list = template.list(topics);
                var html = template.HTML(title, list, 
                    `
                    ${template.authorTable(authors)}
                    <style>
                        table {
                            border-collapse : collapse;
                        }
                        td {
                            border : 1px solid black; 
                        }
                    </style>
                    <form action="/author/process_update" method="post">
                        <p>
                            <input type="hidden" name="id" value="${queryData.id}"
                        </p>
                        <p>
                            <input type="text" name="name" value="${author[0].name}"placeholder="name">
                        </p>
                        <p>
                            <textarea name="profile" placeholder="description">${author[0].profile}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="update">
                        </p>
                    </form>
                    `,``                 
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}


exports.process_update = function(request, response) {
    // body 정의 ~ request.on() 선언 : post방식으로 넘어온 데이터를 받는 로직
    var body = '';
    request.on('data', function(data) {  // 수신하는 데이터가 너무 커서 생기는 문제를 방지하기 위해 데이터를 분할하여 보낸다. 분할된 데이터가 들어올 때 마다 이 콜백 메서드가 실행된다. data == 분할되어 들어온 데이터.
      body = body + data;
    });
    request.on('end', function() {  // 더이상 들어올 데이터가 없을 때 실행되는 콜백 메서드.
      var post = qs.parse(body);
      db.query(`update author set name=?, profile=? where id=?`,
                [post.name, post.profile, post.id], 
                function(error, result) {
                  if (error) throw error;
                  response.writeHead(302, {Location : `/author`});
                  response.end();
                }
      );
    });
}

exports.process_delete = function(request, response) {
    // body 정의 ~ request.on() 선언 : post방식으로 넘어온 데이터를 받는 로직
    var body = '';
    request.on('data', function(data) {  // 수신하는 데이터가 너무 커서 생기는 문제를 방지하기 위해 데이터를 분할하여 보낸다. 분할된 데이터가 들어올 때 마다 이 콜백 메서드가 실행된다. data == 분할되어 들어온 데이터.
      body = body + data;
    });
    request.on('end', function() {  // 더이상 들어올 데이터가 없을 때 실행되는 콜백 메서드.
      var post = qs.parse(body);
      db.query(`delete from topic where author_id=?`, [post.id], function(error, result) {
        if (error) throw error;
        db.query(`delete from author where id=?`, 
                [post.id], 
                function(error, result) {
                  if (error) throw error;
                  response.writeHead(302, {Location : `/author`});
                  response.end();
                }
        );
      });
    });
}