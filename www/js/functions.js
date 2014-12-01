function ajaxHtml(url,query,callback) {
    if(!query)
        query = {}

    query.ajax = true;

    $.ajax({
        type : "GET",
        url : url,
        dataType : 'html',
        cache : false,
        async: false,
        data: query,
        headers: {
            'Accept' : "text/html, */*; q=0.01",
            'Content-Type': "text/html"
        },
        'jsonpCallback' : '',
        success : function(data) {
            callback.call(this,data);
        }

    });
}

function dateCur() {
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = day + "/" + month + "/" + year;

    return date;
}

function loadPage(page){
    if(page !== window.currentPage || window.forceReload)
        $('.list-group','#content').slideUp(150,function(){
            window.currentPage = page;
            window.forceReload = false;
            $('#'+page).fadeIn().height('auto');
            reload();
        })
}

function reload(){
    $('.sortable').sortable({
        'placeholder': "list-group-item shadow",
        'handle': '.handle',
        'stop': function(e,obj) {
                    itens = $(obj.item).parents('ul.itens').find('li.item');

                    reposition(itens);

                    clone = itens = $(obj.item).parents('ul.itens').clone();
                    $('li[date=null]',clone).remove();

                    if(window.currentPage == 'today')
                        $('ul.itens','#all ul[groupId='+dateToGroupId(dateCur())+']').html(clone.html());
                    else{
                        fixed = $('li[date!=null]','#today').remove();

                        $('#today').append( clone.html());
                    }
        }
    })
}

function removeItem(itemId){
    $('li[itemId='+itemId+']').fadeOut(500,function(){
        newEdit(itemId,1);
        window.itensRemove.push(itemId);
        $(this).remove();
    });
}

function createGroup(group,name){
    if($('[groupId='+group+']').is('ul'))
        return;

    allGroups = $('#all').find('ul.group')

    okGroup = false;

    groupHtml = replaceModel('group',group,window.htmlContents.group);
    groupHtml = replaceModel('title',name,groupHtml);
    groupHtml = replaceModel('content','',groupHtml);

    for(i=0;allGroups.length>i;i++){
        curGroup = $(allGroups[i]).attr('groupId')
        if(curGroup > group){
            $(allGroups[i]).before(groupHtml)
            return;
        }
    }

    $('#all').append(groupHtml)

}

function editItem(itemId){
    item = $('li[itemId='+itemId+']','#'+window.currentPage)

    data = {};
    data.title = $('.title',item).text();
    data.description =  $('.description',item).text().trim();
    data.date = item.attr('date');
    data.itemId = itemId;
    data.editionTitle = 'Editar Tarefa';

    window.currentItem = data;

    $('#plus-bt').click()
}

function newEdit(item,value){
    window.alter = $.now();
    $('li[itemId='+item+']').attr('edit',value)
}

function saveItem(){
    edit = $('#edit');
    title = $('[name=title]',edit).val();
    description = $('[name=description]',edit).val();
    type = $('[name=type]:checked',edit).val();
    date = (type == 'date') ? $.datepicker.formatDate('dd/mm/yy',window.calendar.datepicker('getDate')) : null;

    if(date){
        date_ = date.split('/');
        group = date_[2]+''+date_[1]+''+date_[0]
    }

    if(window.currentItem){
        newEdit(window.currentItem.itemId,1);
        var item = $('li[itemId='+window.currentItem.itemId+']');

        item.attr('date',date ? date : 'null');
        $('.title',item).text(title.trim());
        $('.description',item).text(description.trim());

        //Caso exista uma data, o objeto é arrancado para ser adicionado posteriormente a um grupo especifico
        if(date){
            itemClone = $('li[itemId='+window.currentItem.itemId+']','#'+window.currentPage)
            var obj = itemClone.clone()
            $('li[itemId='+window.currentItem.itemId+']').remove();
        }

    }
    else{
        var newId = window.lastId++;
        data = {
            'title' : title,
            'description' : description,
            'date' : date? date : 'null',
            'id' : newId,
            'checked' : false
        }

        var obj = createList([data],window.htmlContents.list)[0];

        if(!date)
            $('#today.itens').append(obj);

        newEdit(newId,1);
    }

    if(date){
        createGroup(group,date);

        curGroupItens = $('ul.itens','[groupId='+group+']')
        reposition(curGroupItens.find('li.item'));

        curGroupItens.append(obj)

        itemId = newId ? newId : window.currentItem.itemId;

        if(date == dateCur() && !itemExists(itemId,'today')){
            $('#today').append(obj);
            reposition($('#today').find('li.item'));
        }
        else if(date != dateCur() && itemExists(itemId,'today')){
            $('li[itemId='+itemId+']','#today').remove();
        }
    }
    else
        reposition($('#today').find('li.item'));

    window.currentItem = false;
    clearEdit();
}

function reposition(itens){
    for(i=0;itens.length>i;i++){
        $(itens[i]).attr('position',i + 1);
        newEdit($(itens[i]).attr('itemId'),1)
    }
}

function itemNotExists(itemId,local){
    if(!$('#'+local).find('li[itemId='+itemId+']').length)
        return true;

    return false;
}

function itemExists(itemId,local){
        return !itemNotExists(itemId,local);
}

function getLastId(){
    $.ajax({
            'url' : window.dbUrlLastId,
            'success' : function(data){
                window.lastId = data + 1;
            }
        }
    )

    return window.lastId;
}

function clearEdit(){
    edit = $('#edit');

    if(window.currentItem){
        $('#title-edit').text(window.currentItem.editionTitle);
        $('input[name=title]',edit).val(data.title);
        $('textarea[name=description]',edit).val(data.description);

        if(eval(data.date)){
            $('input[value=date]',edit).prop('checked',true);
            $('input[value=checked]',edit).prop('checked',false);
            window.calendar.datepicker('setDate', data.date);
            $('#calendar').show();
        }

        return;
    }

    $('input[name=title]').prop('value','');
    $('textarea[name=description]').prop('value','');
    $('input[value=checked]','#type').prop('checked',true);
    $('input[value=date]','#type').prop('checked',false);

    window.calendar.datepicker('setDate', dateCur());
    $('#calendar').hide()


    $('#title-edit').text('Nova Tarefa')

}

function loaderStart(start){
    if(start === false){
        $('#loader').hide()
        $('#plus-bt').show()
        return;
    }

    $('#loader').show()
    $('#plus-bt').hide()
}

function loadModel(){
    $.get('model.html',function(data){
        window.model = data;
    })
}

function replaceModel(target,newVal,model){
    return model.replace('{%'+target+'%}',newVal);
}


function getDataServe(callback){
    $.ajax({
        'url' : window.dbUrlGet,
        'success' :function(data){
            window.data = data;
            callback.call();
        }
    });
}

function createList(data,modelDefault){
    list = [];

    for(var i=0; data.length > i; i++){
        model = replaceModel('itemId',data[i].id,modelDefault)
        model = replaceModel('title',data[i].title,model)
        model = replaceModel('date',data[i].date,model)
        model = replaceModel('checked',(data[i].checked === false) ? 'fa-square-o' : 'fa-check-square-o',model)
        model = replaceModel('description',data[i].description,model)


        list.push(model)

    }

    return list;
}

function groupIdToDate(group){
    date = '';
    for(i=0;group.length>i;i++){
        if(i == 4 || i == 6)
            date = date + '/'

        date = date + '' + group[i]
    }

    date = date.split('/');
    return date[2] + '/' + date[1] + '/' + date[0]
}

function dateToGroupId(date){
    date = date.split('/');
    return date[2] + '' + date [1] + '' + date[0];
}

function getAllitens(type){
    target = $('#'+type);

    //if(type == 'today'){
    //    all = target.find('.item[edit=1][date=null]');
    //    $('.item[edit=1][date=null]',target).attr('edit',0);
    //}
    //else{
        all = target.find('.item[edit=1]');
        $('.item[edit=1]',target).attr('edit',0);
    //}

    list = [];

    for(i=0;all.length>i;i++){
        obj = $(all[i]);
        date = obj.attr('date');
        item = {};
        item.id = obj.attr('itemId');
        item.date = (!eval(date)) ? 0 : date
        item.title = $('.title',obj).text().trim();
        item.description = $('.description',obj).text().trim();
        item.checked = ($('.fa-check-square-o',obj).is('i')) ? 1 : 0;
        item.position = obj.attr('position');

        list.push(item)
    }

    return list;
}

function saveAll(){
    if(window.alter != window.lastAlter){
        console.log('saving...');
        window.lastAlter = window.alter;
        clearTimeout(window.donwtimeOut);
        window.donwtimeOut = setTimeout(function(){
            reloadAll()
        },window.timeReload)
        save();
    }
}

function save(){
    loaderStart();

    $.ajax({
        'url' : window.dbUrlSave+'?callback=jQuery172045650608581490815_1417466894908',
        'data' : {'all' : getAllitens('all'), 'today' : getAllitens('today'), 'remove' : removes()},
        'success' :function(data){
            loaderStart(false);

            if(!data)
                alert('Ocorreu um erro, seus dados não foram salvos.')
            else
                getLastId();
        },
        //'type' : 'POST',
        crossDomain: true,
        'dataType' : 'jsonp'
    });

}

function removes(){
    if(window.itensRemove.length == 0)
        return []

    remove = [];
    for(i=0;window.itensRemove.length>i;i++){
        remove.push({'id' : window.itensRemove[i]})
    }

    window.itensRemove = [];

    return remove;
}

function init(callback){
    getLastId();
    getDataServe(function(){
        window.lists.today = createList(window.data.today,window.htmlContents.list);

        all = [];

        for(i=0; window.data.all.length > i; i++ ){
            group = replaceModel('group',window.data.all[i].name,window.htmlContents.group);
            group = replaceModel('title',window.data.all[i].title,group);

            list = createList(window.data.all[i].itens,window.htmlContents.list);

            group = replaceModel('content',list.join("\n"),group);

            all.push(group)
        }

        todayHtml = replaceModel('content',window.lists['today'].join("\n"),window.htmlContents['today']);
        allHtml = replaceModel('content',all.join("\n"),window.htmlContents.all);
        $('#content').html(todayHtml + allHtml);

        reload();

        loadPage(window.defaultPage);

        if(callback != undefined)
            callback.call(this);

    });
}

function reloadAll(animateOpen){
    if($('#edit.absolute').is('div'))
        return;

    loaderStart();
    animateOpen = animateOpen ? 0 : 300

    heightWindow = $(window).height();
    $('#edit').animate({
        height : (heightWindow ) + 'px'
    },animateOpen,false,function(){
        $(this).addClass('absolute');
        $('#page').hide();
        $('#loader').addClass('center')
    })

    if(window.currentPage){
        window.defaultPage = window.currentPage;
        window.forceReload = true;
    }

    init(function(){


        var t = setTimeout(function(){

            $('#loader').stop(false,true).fadeOut(300,function(){
                $('#plus-bt').stop(false,true).fadeIn(150);
            });

            $('#edit').removeClass('absolute').animate({
                height : 64+ 'px'
            },500,false,function(){

                $('#page').fadeIn();
                $('#loader').removeClass('center')
            })

        },1000)

        window.donwtimeOut = setTimeout(function(){
            reloadAll();
        },window.timeReload)

    });
}