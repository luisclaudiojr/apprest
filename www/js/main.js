window.defaultPage = 'today';
server = 'http://104.236.27.227/dot/';
window.dbUrlGet = server+'tasks/all';
window.dbUrlSave = server+'tasks/save';
window.dbUrlLastId = server+'tasks/lastId';

window.htmlContents = {
    'today' : '<ul id="today" class="itens sortable list-group table table-striped table-hover">{%content%}</ul>',
    'all' : '<ul id="all" class="list-group table table-striped table-hover">{%content%}</ul>',
    'group' : '<ul groupId="{%group%}" class="group"><li class="list-group-item title"><div class="row"><div class="col-xs-11"><h4>{%title%}</h4></div><div class="col-xs-1 remove-group"><i class="fa fa-trash-o"></i></div></div></li><ul class="sortable itens">{%content%}</ul></ul>'
}

window.page = {
    'today' : [],
    'all' : []
}

window.lists = {
    'today' : [],
    'all' : []
};

window.itensRemove = []

window.timeReload = 250 * 1000;

$.ajaxSetup({
    headers: {
        'Accept' : "application/json, text/javascript, */*; q=0.01",
        'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"
    },
    'dataType' : 'jsonp'
})

/*
* Start App
* */
ajaxHtml('model.html',false,function(data){
    window.htmlContents.list = data;
    reloadAll(true);
});


/*
* Upload & Download Webservice
* */


window.donwtimeOut = setTimeout(function(){
    reloadAll();
},window.timeReload)

var saveInterval = setInterval(function(){
    saveAll();
},1000);


window.onbeforeunload = function() {
    save();
}