var http = require('http');
var url = require('url');
var topic = require('./lib/topic');

var app = http.createServer(function(request,response){  // function : 서버로의 호출 있을 때 마다 실행될 콜백 메서드
    var _url = request.url;
    var queryData = url.parse(_url, true).query;  // queryString 정보
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {  // pathname이 root일 경우 (pathname : queryString제외한 path만 보여줌, path : queryString까지 모두 포함)
      if (queryData.id === undefined) {  // 기본 페이지
        topic.home(request, response);
      } else {  // 목록 중 하나를 선택했을 때 활성화 되는 부분
        topic.page(request, response);
      }
    } else if (pathname === '/create') {
      topic.create(request, response);
    } else if (pathname === '/process_create') {  // /create에서 데이터를 넘겨주면서 바로 /process_create로 이동하게 된다.
      topic.process_create(request, response);
    } else if (pathname === '/update') {
      topic.update(request, response);
    } else if (pathname === '/process_update') {  // /update에서 데어터를 넘겨주면서 바로 /process_update로 이동하게 된다.
      topic.process_update(request, response);
    } else if (pathname === '/process_delete') {
      topic.process_delete(request, response);
    } else if (pathname === '/author') {
      author.home(request, response);
    } else if (pathname === '/author/process_create') {
      author.process_create(request, response);
    } else if (pathname === '/author/update') {
      author.update(request, response);
    } else if (pathname === '/author/process_update') {
      author.process_update(request, response);
    } else if (pathname === '/author/process_delete') {
      author.process_delete(request, response);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
