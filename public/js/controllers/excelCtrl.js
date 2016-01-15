var myApp =  angular.module('myApp');

myApp.controller('excelCtrl', function($scope){

var ep=new ExcelPlus();
// we call openLocal() and when the file is loaded then we want to display its content
// openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
ep.openLocal({
  "flashPath":"2.2/swfobject/",
  "labelButton":"Open an Excel file"
},function() {
  // show the content of the first sheet
  var a = ep.selectSheet(1).readAll();
  var html = "<table>";
  for (var i=0; i < a.length; i++) {
    html += '<tr>';
    for (var j=0; j < a[i].length; j++) {
      html += '<td>'+a[i][j]+'</td>'
    }
    html += '</tr>';
  }
  html += '</table>'
  document.querySelector("#result").insertAdjacentHTML('beforeend', html);
})


});

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																					