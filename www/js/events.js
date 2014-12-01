$(function(){
    window.alter = 0;
    window.lastAlter = 0;
    var timeSet = []
    var content = $('#content')
    window.currentItem = false
    window.calendar =  $( "#datepicker" );

    window.calendar.datepicker({
        dateFormat: 'dd/mm/yy',
        altFormat: 'dd/mm/yy',
        dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
        dayNamesMin: ['D','S','T','Q','Q','S','S','D'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        nextText: 'Próximo',
        prevText: 'Anterior'

    });

    content.on('click','.recover',function(){
        var item = $(this).parents('.list-group-item')
        itemId = item.attr('itemId')
        clearTimeout(timeSet[itemId]);

        $(this).fadeOut(150,function(){
            $('.item',item).fadeIn()
        })
    })

    content.on('click','.remove-line',function(){
        item = $(this).parents('div.item')
        var top = $(this).parents('.top')
        item.fadeOut(250,function(){
            top.append('<div class="recover col-xs-12 text-right" ><i class="fa fa-reply"></i> Desfazer</div>')
            item = top.parents('.list-group-item');
            var itemId = item.attr('itemId')

            timeSet[itemId] = setTimeout(function(){
                removeItem(itemId)
            },5000)

        })
    })

    content.on('click','.checked i',function(){
        itemId = $(this).parents('li.item').attr('itemId');
        checked = $('.checked i','li[itemId='+itemId+']');
        newEdit(itemId,1);
        if(!checked.hasClass('fa-check-square-o')){
            checked.addClass('fa-check-square-o').removeClass('fa-square-o');
            return;
        }

        checked.addClass('fa-square-o').removeClass('fa-check-square-o');
    })

    content.on('click','.title',function(){
        title = $(this);
        parent_ = title.parents('.list-group-item')
        if(!title.hasClass('open')){
            title.addClass('open');
            $('.description',parent_).stop(true,true).slideDown();
            return;
        }

        title.removeClass('open');
        $('.description',parent_).stop(true,true).slideUp()
    })

    content.on('click','.edit-item', function(){
        item = $(this).parents('li.item')
        itemId = item.attr('itemId')
        editItem(itemId)
    })

    content.on('click','.remove-group',function(){
        group = $(this).parents('ul.group')
        date = groupIdToDate(group.attr('groupId'))

        if(confirm('Tem certeza que deseja remover todas as tarefas de '+date+'?')){
            itens = group.find('li.item');
            group.fadeOut(300,function(){

                for(i=0;itens.length>i;i++){
                    itemId = $(itens[i]).attr('itemId');
                    window.itensRemove.push(itemId);
                    newEdit(itemId,1);
                }


                $('li[itemId="'+date+'"]').remove()
                $(this).remove()

            })

        }
    })

    $('.today-bt','#menu').click(function(){
        $('.center-menu','#menu').addClass('today').removeClass('all').html('<h3 class="nomargin">Tarefas do dia</h3>')
        loadPage('today');
    })

    $('.all-bt','#menu').click(function(){
        $('.center-menu','#menu').addClass('all').removeClass('today').html('<h3 class="nomargin">Todas as tarefas</h3>')
        loadPage('all');
    })

    $('#plus-bt,#loader').click(function(){
        clearEdit();

        heightWindow = $(window).height();

        $('#edit').animate({
            height : (heightWindow ) + 'px'
        },250,false,function(){
            $(this).addClass('absolute');
            $('#page').hide();
        })

        $(this).fadeOut(250,function(){
            $('#edit-task').fadeIn()
        })
    })

    $('#save-task,#cancel-task').click(function(){
        var option = $(this).attr('id').replace('-task','')

        if(option == 'save' && !$('[name=title]','#edit').val()){
            alert('Ops, você esqueceu do título da tarefa. Não é possível salva-la assim...')
            return;
        }

        $('#page').fadeIn()
        $('#edit').removeClass('absolute').animate({
            height : 64 + 'px'
        })

        if(option !== 'save'){
            $('#edit-task').fadeOut(250,function(){
                $('#plus-bt').fadeIn()
                window.currentItem = false;
                clearEdit();
            })
            return;
        }

        $('#edit-task').fadeOut(250,function(){
            $('#plus-bt').fadeIn()
            saveItem();
        });
    })

    $('input[name=type]','#edit').change(function(){
        if($(this).val() === 'date'){
            $('#calendar').slideDown()
            return;
        }

        $('#calendar').slideUp()

    })

    $('form').submit(function(){
        return false;
    })

})