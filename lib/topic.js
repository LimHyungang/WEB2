var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var db = require('./db');

exports.home = function(request, response) {    
    db.query(`select * from topic`, function(error, topics) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list, 
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href="/create">create</a>`                         
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;  // queryString 정보
    db.query(`select * from topic`, function(error, topics) {
        if (error) throw error;
        // ${queryData.id}보다는 쿼리의 ?에 들어갈 값을 다음 매개변수에 배열 형태로 보내주는게 보안상 더 좋다.
        db.query(`select * from topic left join author on topic.author_id=author.id where topic.id=?`, [queryData.id], function(error2, topic) {
          if (error2) throw error2;
          var title = topic[0].title;  // 객체 형태의 튜플이 배열에 담겨서 들어오기 때문에 [0] 해줘야 함
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(title, list, 
           `<h2>${title}</h2>
            <p>${description}</p>
            <p>by ${topic[0].name}</p>`,
           `<a href="/create">create</a>
             <a href="/update?id=${queryData.id}">update</a>
             <form action="/process_delete" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
             <form>`                         
          );
          response.writeHead(200);
          response.end(html);
        });
      });
}

exports.create = function(request, response) {
    db.query(`select * from topic`, function(error, topics) {
        db.query(`select * from author`, function(error2, authors) {
          var title = 'Create';
          var list = template.list(topics);
          var html = template.HTML(title, list, 
            `<form action="http://localhost:3000/process_create" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              ${template.authorSelect(authors)}
            </p>
            <p>
              <input type="submit">
            </p>
            </form>`,
            `<a href="/create">create</a>`                         
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
      db.query(`insert into topic (title, description, created, author_id) 
                values (?, ?, now(), ?)`, 
                [post.title, post.description, post.author], // post.author : template.authorSelect의 <select name="author">중 선택된 <option>의 value 
                function(error, result) {
                  if (error) throw error;
                  response.writeHead(302, {Location : `/?id=${result.insertId}`});
                  response.end();
                }
      );
    });
}

exports.update = function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;  // queryString 정보
    db.query(`select * from topic`, function(error, topics) {
        if (error) throw error;
        db.query(`select * from topic where id=?`, [queryData.id], function(error2, topic) {
          if (error2) throw error2;
          db.query(`select * from author`, function(error3, authors) {
            if (error3) throw error3;

            var list = template.list(topics);
            var html = template.HTML(topic[0].title, list,
              // <form>에서 입력받은 데이터들을 post방식으로 넘겨준다.
              `
              <form action="/process_update" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            // 첫번쨰 <input> : 수정할 대상 파일의 이름을 넘겨주기 위함
            // 두번쨰 <input> value : 기본값
            // textarea는 기본값을 value 속성이 아닌 태그 사이에 넣어서 설정
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
      db.query(`update topic set title=?, description=?, author_id=? where id=?`, [post.title, post.description, post.author, post.id], function(error, result) {
        response.writeHead(302, {Location : `/?id=${post.id}`}); 
        response.end(); 
      });
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
      db.query(`delete from topic where id =?`, [post.id], function(error, result) {
        if (error) throw error;
        response.writeHead(302, {Location : `/`});
        response.end();
      });
    });
}