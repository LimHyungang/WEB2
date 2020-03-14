var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');

var app = http.createServer(function(request,response){  // localhost를 통해 동작시킬 app
    var _url = request.url;
    var queryData = url.parse(_url, true).query;  // queryString 정보
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {  // pathname이 root일 경우 (pathname : queryString제외한 path만 보여줌, path : queryString까지 모두 포함)
      if (queryData.id === undefined) {  // 기본 페이지
        fs.readdir('./data', function(error, filelist) {
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.HTML(title, list, 
            `<h2>${title}</h2><p>${description}</p>`,
            `<a href="/create">create</a>`                         
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {  // 목록 중 하나를 선택했을 때 활성화 되는 부분
        fs.readdir('./data', function(error, filelist) {
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.HTML(title, list, 
              `<h2>${title}</h2><p>${description}</p>`
              `<a href="/create">create</a>
               <a href="/update?id=${title}">update</a>
               <form action="/process_delete" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
               <form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if (pathname === '/create') {
      fs.readdir('./data', function(error, filelist) {
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, 
          `<form action="http://localhost:3000/process_create" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>`, ''
        );
        response.writeHead(200);
        response.end(html);
      });
    } else if (pathname === '/process_create') {  // /create에서 데이터를 넘겨주면서 바로 /process_create로 이동하게 된다.
      // body 정의 ~ request.on() 선언 : post방식으로 넘어온 데이터를 받는 로직
      var body = '';
      request.on('data', function(data) {  // 수신하는 데이터가 너무 커서 생기는 문제를 방지하기 위해 데이터를 분할하여 보낸다. 분할된 데이터가 들어올 때 마다 이 콜백 메서드가 실행된다. data == 분할되어 들어온 데이터.
        body = body + data;
      });
      request.on('end', function() {  // 더이상 들어올 데이터가 없을 때 실행되는 콜백 메서드.
        var post = qs.parse(body);
        var title = post.title;  // 받아온 데이터 값을 가져올 수 있게 되었다.
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location : `/?id=${title}`});
          response.end();  // writeHead() 받은 Location으로의 이동은 여기서 이뤄진다
        });
      });
    } else if (pathname === '/update') {
      fs.readdir('./data', function(error, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            // <form>에서 입력받은 데이터들을 post방식으로 넘겨준다.
            `
            <form action="/process_update" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          // 첫번쨰 <input> : 수정할 대상 파일의 이름을 넘겨주기 위함
          // 두번쨰 <input> value : 기본값
          // textarea는 기본값을 value 속성이 아닌 태그 사이에 넣어서 설정
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (pathname === '/process_update') {  // /update에서 데어터를 넘겨주면서 바로 /process_update로 이동하게 된다.
      // body 정의 ~ request.on() 선언 : post방식으로 넘어온 데이터를 받는 로직
      var body = '';
      request.on('data', function(data) {  // 수신하는 데이터가 너무 커서 생기는 문제를 방지하기 위해 데이터를 분할하여 보낸다. 분할된 데이터가 들어올 때 마다 이 콜백 메서드가 실행된다. data == 분할되어 들어온 데이터.
        body = body + data;
      });
      request.on('end', function() {  // 더이상 들어올 데이터가 없을 때 실행되는 콜백 메서드.
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;  // 받아온 데이터 값을 가져올 수 있게 되었다.
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error) {
          // 콜백 : 파일 내용 수정
          fs.writeFile(`data/${title}`, description, 'utf8', function(error) {
            response.writeHead(302, {Location : `/?id=${title}`});  // id값까지 수정해줘야함
            response.end();  // writeHead() 받은 Location으로의 이동은 여기서 이뤄진다
          });
        });

      });
    } else if (pathname === '/process_delete') {
      // body 정의 ~ request.on() 선언 : post방식으로 넘어온 데이터를 받는 로직
      var body = '';
      request.on('data', function(data) {  // 수신하는 데이터가 너무 커서 생기는 문제를 방지하기 위해 데이터를 분할하여 보낸다. 분할된 데이터가 들어올 때 마다 이 콜백 메서드가 실행된다. data == 분할되어 들어온 데이터.
        body = body + data;
      });
      request.on('end', function() {  // 더이상 들어올 데이터가 없을 때 실행되는 콜백 메서드.
        var post = qs.parse(body);
        var id = post.id;
        fs.unlink(`data/${id}`, function(error) {  // 입력받은 경로의 파일 삭제
          response.writeHead(302, {Location : `/`});  // id값까지 수정해줘야함
          response.end();  // writeHead() 받은 Location으로의 이동은 여기서 이뤄진다
        });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
